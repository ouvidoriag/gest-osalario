import type { Database } from 'sql.js';
import type { Transaction, Category, Tag, ThirteenthSalary, Person, Priority, PaymentStatus } from '../types';

let db: Database | null = null;
let dbInitialized = false;

// Inicializa o banco de dados SQLite
export const initDatabase = async (): Promise<Database> => {
  if (db && dbInitialized) {
    return db;
  }

  try {
    // Importação dinâmica do sql.js para evitar problemas com Vite
    const sqlJsModule = await import('sql.js');
    
    // sql.js 1.13.0 exporta de forma diferente
    let initSqlJs: any;
    if (sqlJsModule.default && typeof sqlJsModule.default === 'function') {
      initSqlJs = sqlJsModule.default;
    } else if (typeof sqlJsModule === 'function') {
      initSqlJs = sqlJsModule;
    } else if ((sqlJsModule as any).initSqlJs) {
      initSqlJs = (sqlJsModule as any).initSqlJs;
    } else {
      // Tenta acessar diretamente
      initSqlJs = (sqlJsModule as any);
    }
    
    if (typeof initSqlJs !== 'function') {
      console.error('Erro: initSqlJs não é uma função');
      console.error('Módulo recebido:', sqlJsModule);
      console.error('Tipo:', typeof sqlJsModule);
      console.error('Chaves:', Object.keys(sqlJsModule));
      throw new Error('Não foi possível inicializar sql.js. Verifique a importação.');
    }
    
    const SQL = await initSqlJs({
      locateFile: (file: string) => {
        // Tenta carregar do CDN
        return `https://sql.js.org/dist/${file}`;
      }
    });

    // Tenta carregar banco existente do localStorage
    const savedDb = localStorage.getItem('finance_db');
    
    if (savedDb) {
      try {
        const buffer = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
        db = new SQL.Database(buffer);
        // Verifica se as tabelas existem, se não, cria
        try {
          db.exec('SELECT 1 FROM transactions LIMIT 1');
        } catch {
          // Tabelas não existem, recria
          createTables(db);
          dbInitialized = true;
        }
      } catch (error) {
        console.warn('Erro ao carregar banco existente, criando novo:', error);
        db = new SQL.Database();
        createTables(db);
        dbInitialized = true;
      }
    } else {
      db = new SQL.Database();
      createTables(db);
      dbInitialized = true;
    }

    return db;
  } catch (error) {
    console.error('Erro ao inicializar SQLite:', error);
    throw error;
  }
};

// Cria as tabelas do banco com índices
const createTables = (database: Database) => {
  // Tabela de transações
  database.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT,
      priority TEXT,
      status TEXT,
      installment_current INTEGER,
      installment_total INTEGER,
      is_fixed_expense INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Índices para melhor performance
  database.run(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_transactions_date_type ON transactions(date, type)`);

  // Tabela de categorias
  database.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)`);

  // Tabela de tags
  database.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`);

  // Tabela de 13º salário
  database.run(`
    CREATE TABLE IF NOT EXISTS thirteenth_salaries (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      entry_date TEXT NOT NULL,
      installments INTEGER NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_thirteenth_entry_date ON thirteenth_salaries(entry_date)`);

  // Tabela de pessoas
  database.run(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gross_salary REAL NOT NULL,
      net_salary REAL NOT NULL,
      thirteenth_salary REAL NOT NULL,
      payment_day INTEGER NOT NULL CHECK(payment_day >= 1 AND payment_day <= 31),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_people_name ON people(name)`);
};

// Salva o banco no localStorage
const saveDatabase = () => {
  if (!db) return;
  
  try {
    const data = db.export();
    const buffer = Array.from(data);
    const base64 = btoa(String.fromCharCode(...buffer));
    localStorage.setItem('finance_db', base64);
  } catch (error) {
    console.error('Erro ao salvar banco:', error);
  }
};

// Transações
export const sqliteStorage = {
  // Inicializar
  init: async () => {
    await initDatabase();
  },

  // Transações
  getTransactions: (): Transaction[] => {
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM transactions ORDER BY date DESC, description');
      if (result.length === 0) return [];
      
      const rows = result[0].values;
      return rows.map(row => ({
        id: row[0] as string,
        type: row[1] as 'income' | 'expense',
        description: row[2] as string,
        amount: row[3] as number,
        date: row[4] as string,
        category: row[5] as string,
        tags: row[6] ? JSON.parse(row[6] as string) : [],
        priority: row[7] as Priority | undefined,
        status: row[8] as PaymentStatus | undefined,
        installment: row[9] && row[10] ? {
          current: row[9] as number,
          total: row[10] as number,
        } : undefined,
      }));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]): void => {
    if (!db) return;
    
    try {
      db.run('DELETE FROM transactions');
      
      const stmt = db.prepare(`
        INSERT INTO transactions 
        (id, type, description, amount, date, category, tags, priority, status, installment_current, installment_total, is_fixed_expense)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      transactions.forEach(trans => {
        // Identifica se é gasto fixo (recorrente sem parcela)
        const isFixed = trans.tags.includes('Recorrente') && !trans.installment;
        
        stmt.run([
          trans.id,
          trans.type,
          trans.description,
          trans.amount,
          trans.date,
          trans.category,
          JSON.stringify(trans.tags),
          trans.priority || null,
          trans.status || null,
          trans.installment?.current || null,
          trans.installment?.total || null,
          isFixed ? 1 : 0,
        ]);
      });
      
      stmt.free();
      saveDatabase();
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    }
  },

  // Categorias
  getCategories: (): Category[] => {
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM categories');
      if (result.length === 0) return [];
      
      const rows = result[0].values;
      return rows.map(row => ({
        id: row[0] as string,
        name: row[1] as string,
        color: row[2] as string,
        icon: row[3] as string,
        type: row[4] as 'income' | 'expense',
      }));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  },

  saveCategories: (categories: Category[]): void => {
    if (!db) return;
    
    try {
      db.run('DELETE FROM categories');
      
      const stmt = db.prepare(`
        INSERT INTO categories (id, name, color, icon, type)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      categories.forEach(cat => {
        stmt.run([cat.id, cat.name, cat.color, cat.icon, cat.type]);
      });
      
      stmt.free();
      saveDatabase();
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
    }
  },

  // Tags
  getTags: (): Tag[] => {
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM tags');
      if (result.length === 0) return [];
      
      const rows = result[0].values;
      return rows.map(row => ({
        id: row[0] as string,
        name: row[1] as string,
        color: row[2] as string,
      }));
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }
  },

  saveTags: (tags: Tag[]): void => {
    if (!db) return;
    
    try {
      db.run('DELETE FROM tags');
      
      const stmt = db.prepare(`
        INSERT INTO tags (id, name, color)
        VALUES (?, ?, ?)
      `);
      
      tags.forEach(tag => {
        stmt.run([tag.id, tag.name, tag.color]);
      });
      
      stmt.free();
      saveDatabase();
    } catch (error) {
      console.error('Erro ao salvar tags:', error);
    }
  },

  // 13º Salário
  getThirteenthSalaries: (): ThirteenthSalary[] => {
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM thirteenth_salaries');
      if (result.length === 0) return [];
      
      const rows = result[0].values;
      return rows.map(row => ({
        id: row[0] as string,
        amount: row[1] as number,
        entryDate: row[2] as string,
        installments: row[3] as number,
        description: row[4] as string | undefined,
      }));
    } catch (error) {
      console.error('Erro ao buscar 13º salários:', error);
      return [];
    }
  },

  saveThirteenthSalaries: (salaries: ThirteenthSalary[]): void => {
    if (!db) return;
    
    try {
      db.run('DELETE FROM thirteenth_salaries');
      
      const stmt = db.prepare(`
        INSERT INTO thirteenth_salaries (id, amount, entry_date, installments, description)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      salaries.forEach(salary => {
        stmt.run([
          salary.id,
          salary.amount,
          salary.entryDate,
          salary.installments,
          salary.description || null,
        ]);
      });
      
      stmt.free();
      saveDatabase();
    } catch (error) {
      console.error('Erro ao salvar 13º salários:', error);
    }
  },

  // Pessoas
  getPeople: (): Person[] => {
    if (!db) return [];
    
    try {
      const result = db.exec('SELECT * FROM people');
      if (result.length === 0) return [];
      
      const rows = result[0].values;
      return rows.map(row => ({
        id: row[0] as string,
        name: row[1] as string,
        grossSalary: row[2] as number,
        netSalary: row[3] as number,
        thirteenthSalary: row[4] as number,
        paymentDay: row[5] as number,
      }));
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
      return [];
    }
  },

  savePeople: (people: Person[]): void => {
    if (!db) return;
    
    try {
      db.run('DELETE FROM people');
      
      const stmt = db.prepare(`
        INSERT INTO people (id, name, gross_salary, net_salary, thirteenth_salary, payment_day)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      people.forEach(person => {
        stmt.run([
          person.id,
          person.name,
          person.grossSalary,
          person.netSalary,
          person.thirteenthSalary,
          person.paymentDay,
        ]);
      });
      
      stmt.free();
      saveDatabase();
    } catch (error) {
      console.error('Erro ao salvar pessoas:', error);
    }
  },
};

import type { Transaction, Category, Tag, ThirteenthSalary, Person } from '../types';

const DB_NAME = 'FinanceDashboardDB';
const DB_VERSION = 2; // Atualizado para suportar userId

const STORES = {
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  THIRTEENTH_SALARIES: 'thirteenth_salaries',
  PEOPLE: 'people',
} as const;

let db: IDBDatabase | null = null;

// Inicializa o banco IndexedDB
export const initDatabase = (): Promise<IDBDatabase> => {
  if (db) {
    return Promise.resolve(db);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Cria as object stores se não existirem
          if (!database.objectStoreNames.contains(STORES.TRANSACTIONS)) {
            const transactionStore = database.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
            transactionStore.createIndex('date', 'date', { unique: false });
            transactionStore.createIndex('type', 'type', { unique: false });
            transactionStore.createIndex('category', 'category', { unique: false });
            transactionStore.createIndex('status', 'status', { unique: false });
            transactionStore.createIndex('userId', 'userId', { unique: false });
          }

      if (!database.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoryStore = database.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
        categoryStore.createIndex('name', 'name', { unique: true });
        categoryStore.createIndex('type', 'type', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.TAGS)) {
        const tagStore = database.createObjectStore(STORES.TAGS, { keyPath: 'id' });
        tagStore.createIndex('name', 'name', { unique: true });
      }

      if (!database.objectStoreNames.contains(STORES.THIRTEENTH_SALARIES)) {
        database.createObjectStore(STORES.THIRTEENTH_SALARIES, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORES.PEOPLE)) {
        database.createObjectStore(STORES.PEOPLE, { keyPath: 'id' });
      }
    };
  });
};

// Função auxiliar para operações no IndexedDB
const dbOperation = <T>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  return initDatabase().then((database) => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
};

// Limpa todos os dados do IndexedDB
export const clearAllData = async (): Promise<void> => {
  try {
    await initDatabase();
    await indexedDBStorage.saveTransactions([]);
    await indexedDBStorage.saveCategories([]);
    await indexedDBStorage.saveTags([]);
    await indexedDBStorage.saveThirteenthSalaries([]);
    await indexedDBStorage.savePeople([]);
    console.log('✅ Todos os dados do IndexedDB foram limpos!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    throw error;
  }
};

// Limpa todos os dados do localStorage
export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem('finance_db');
    localStorage.removeItem('finance_transactions');
    localStorage.removeItem('finance_categories');
    localStorage.removeItem('finance_tags');
    localStorage.removeItem('finance_thirteenth_salaries');
    localStorage.removeItem('finance_people');
    localStorage.removeItem('migrated_to_indexeddb');
    console.log('✅ Todos os dados do localStorage foram limpos!');
  } catch (error) {
    console.error('❌ Erro ao limpar localStorage:', error);
  }
};

// Limpa TUDO (localStorage + IndexedDB)
export const clearEverything = async (): Promise<void> => {
  clearLocalStorage();
  await clearAllData();
  console.log('✅ Todos os dados foram limpos completamente!');
};

// Migra dados do localStorage para IndexedDB (desabilitado - não usar mais)
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    await initDatabase();
    
    // Migra transações
    const transactionsData = localStorage.getItem('finance_transactions');
    if (transactionsData) {
      const transactions: Transaction[] = JSON.parse(transactionsData);
      for (const transaction of transactions) {
        await dbOperation(STORES.TRANSACTIONS, (store) => store.put(transaction));
      }
      console.log(`✅ Migradas ${transactions.length} transações do localStorage`);
    }

    // Migra categorias
    const categoriesData = localStorage.getItem('finance_categories');
    if (categoriesData) {
      const categories: Category[] = JSON.parse(categoriesData);
      for (const category of categories) {
        await dbOperation(STORES.CATEGORIES, (store) => store.put(category));
      }
      console.log(`✅ Migradas ${categories.length} categorias do localStorage`);
    }

    // Migra tags
    const tagsData = localStorage.getItem('finance_tags');
    if (tagsData) {
      const tags: Tag[] = JSON.parse(tagsData);
      for (const tag of tags) {
        await dbOperation(STORES.TAGS, (store) => store.put(tag));
      }
      console.log(`✅ Migradas ${tags.length} tags do localStorage`);
    }

    // Migra 13º salários
    const salariesData = localStorage.getItem('finance_thirteenth_salaries');
    if (salariesData) {
      const salaries: ThirteenthSalary[] = JSON.parse(salariesData);
      for (const salary of salaries) {
        await dbOperation(STORES.THIRTEENTH_SALARIES, (store) => store.put(salary));
      }
      console.log(`✅ Migrados ${salaries.length} 13º salários do localStorage`);
    }

    // Migra pessoas
    const peopleData = localStorage.getItem('finance_people');
    if (peopleData) {
      const people: Person[] = JSON.parse(peopleData);
      for (const person of people) {
        await dbOperation(STORES.PEOPLE, (store) => store.put(person));
      }
      console.log(`✅ Migradas ${people.length} pessoas do localStorage`);
    }

    console.log('✅ Migração do localStorage para IndexedDB concluída!');
  } catch (error) {
    console.error('❌ Erro ao migrar dados:', error);
    throw error;
  }
};

// Função para obter o ID do usuário atual
const getCurrentUserId = (): string => {
  const currentUser = localStorage.getItem('finance_current_user');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    return user.id;
  }
  return 'admin'; // Fallback para admin
};

// Migra dados antigos para o admin (executa apenas uma vez)
const migrateOldDataToAdmin = async () => {
  const migrated = localStorage.getItem('data_migrated_to_admin');
  if (migrated === 'true') return;

  try {
    const database = await initDatabase();
    
    // Migra transações sem userId para admin
    const transactionsTx = database.transaction([STORES.TRANSACTIONS], 'readwrite');
    const transactionsStore = transactionsTx.objectStore(STORES.TRANSACTIONS);
    const allTransactions = await new Promise<any[]>((resolve, reject) => {
      const request = transactionsStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const t of allTransactions) {
      if (!t.userId) {
        t.userId = 'admin';
        await new Promise<void>((resolve, reject) => {
          const request = transactionsStore.put(t);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    // Migra categorias sem userId para admin
    const categoriesTx = database.transaction([STORES.CATEGORIES], 'readwrite');
    const categoriesStore = categoriesTx.objectStore(STORES.CATEGORIES);
    const allCategories = await new Promise<any[]>((resolve, reject) => {
      const request = categoriesStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const c of allCategories) {
      if (!c.userId) {
        c.userId = 'admin';
        await new Promise<void>((resolve, reject) => {
          const request = categoriesStore.put(c);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    // Migra tags sem userId para admin
    const tagsTx = database.transaction([STORES.TAGS], 'readwrite');
    const tagsStore = tagsTx.objectStore(STORES.TAGS);
    const allTags = await new Promise<any[]>((resolve, reject) => {
      const request = tagsStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const t of allTags) {
      if (!t.userId) {
        t.userId = 'admin';
        await new Promise<void>((resolve, reject) => {
          const request = tagsStore.put(t);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    // Migra 13º salários sem userId para admin
    const salariesTx = database.transaction([STORES.THIRTEENTH_SALARIES], 'readwrite');
    const salariesStore = salariesTx.objectStore(STORES.THIRTEENTH_SALARIES);
    const allSalaries = await new Promise<any[]>((resolve, reject) => {
      const request = salariesStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const s of allSalaries) {
      if (!s.userId) {
        s.userId = 'admin';
        await new Promise<void>((resolve, reject) => {
          const request = salariesStore.put(s);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    // Migra pessoas sem userId para admin
    const peopleTx = database.transaction([STORES.PEOPLE], 'readwrite');
    const peopleStore = peopleTx.objectStore(STORES.PEOPLE);
    const allPeople = await new Promise<any[]>((resolve, reject) => {
      const request = peopleStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const p of allPeople) {
      if (!p.userId) {
        p.userId = 'admin';
        await new Promise<void>((resolve, reject) => {
          const request = peopleStore.put(p);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }

    localStorage.setItem('data_migrated_to_admin', 'true');
    console.log('✅ Dados antigos migrados para conta admin');
  } catch (error) {
    console.error('Erro ao migrar dados:', error);
  }
};

// Storage usando IndexedDB
export const indexedDBStorage = {
  // Transações
  getTransactions: async (): Promise<Transaction[]> => {
    await migrateOldDataToAdmin();
    const userId = getCurrentUserId();
    const allTransactions = await dbOperation<Transaction[]>(STORES.TRANSACTIONS, (store) => store.getAll());
    // Filtra APENAS transações do usuário atual (sem fallback)
    return allTransactions.filter((t: any) => t.userId === userId);
  },

  saveTransactions: async (transactions: Transaction[]): Promise<void> => {
    const userId = getCurrentUserId();
    
    // Primeiro, obtém todas as transações (em transação separada de leitura)
    const allTransactions = await dbOperation<Transaction[]>(STORES.TRANSACTIONS, (s) => s.getAll());
    const otherUsersTransactions = allTransactions.filter((t: any) => t.userId && t.userId !== userId);
    
    // Agora cria uma única transação de escrita para fazer tudo
    const database = await initDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORES.TRANSACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.TRANSACTIONS);
      
      // Limpa todas as transações
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Adiciona transações de outros usuários de volta
        let added = 0;
        const totalToAdd = otherUsersTransactions.length + transactions.length;
        
        if (totalToAdd === 0) {
          resolve();
          return;
        }
        
        const addNext = () => {
          if (added < otherUsersTransactions.length) {
            const trans = otherUsersTransactions[added];
            const addRequest = store.add(trans);
            addRequest.onsuccess = () => {
              added++;
              addNext();
            };
            addRequest.onerror = () => reject(addRequest.error);
          } else if (added < totalToAdd) {
            const trans = transactions[added - otherUsersTransactions.length];
            const transWithUser = { ...trans, userId };
            const addRequest = store.add(transWithUser);
            addRequest.onsuccess = () => {
              added++;
              if (added === totalToAdd) {
                resolve();
              } else {
                addNext();
              }
            };
            addRequest.onerror = () => reject(addRequest.error);
          }
        };
        
        addNext();
      };
      
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  },

  addTransaction: async (transaction: Transaction): Promise<void> => {
    const userId = getCurrentUserId();
    const transWithUser = { ...transaction, userId };
    await dbOperation(STORES.TRANSACTIONS, (store) => store.add(transWithUser));
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<void> => {
    const database = await initDatabase();
    const transaction = database.transaction([STORES.TRANSACTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.TRANSACTIONS);
    
    const getRequest = store.get(id);
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Transação não encontrada'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await dbOperation(STORES.TRANSACTIONS, (store) => store.delete(id));
  },

  // Categorias
  getCategories: async (): Promise<Category[]> => {
    await migrateOldDataToAdmin();
    const userId = getCurrentUserId();
    const allCategories = await dbOperation<Category[]>(STORES.CATEGORIES, (store) => store.getAll());
    return allCategories.filter((c: any) => c.userId === userId);
  },

  saveCategories: async (categories: Category[]): Promise<void> => {
    const userId = getCurrentUserId();
    const database = await initDatabase();
    
    // Primeiro, pega todas as categorias
    const allCategories = await new Promise<any[]>((resolve, reject) => {
      const transaction = database.transaction([STORES.CATEGORIES], 'readonly');
      const store = transaction.objectStore(STORES.CATEGORIES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Filtra apenas categorias de outros usuários
    const otherUsersCategories = allCategories.filter((c: any) => c.userId && c.userId !== userId);
    
    // Limpa e reescreve tudo
    const transaction = database.transaction([STORES.CATEGORIES], 'readwrite');
    const store = transaction.objectStore(STORES.CATEGORIES);
    
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        const allToAdd = [
          ...otherUsersCategories,
          ...categories.map(c => ({ ...c, userId } as any))
        ];
        
        if (allToAdd.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        allToAdd.forEach(cat => {
          const addRequest = store.add(cat);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === allToAdd.length) resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  },

  addCategory: async (category: Category): Promise<void> => {
    const userId = getCurrentUserId();
    const categoryWithUser = { ...category, userId } as any;
    // Verifica se já existe antes de adicionar
    const database = await initDatabase();
    const transaction = database.transaction([STORES.CATEGORIES], 'readonly');
    const store = transaction.objectStore(STORES.CATEGORIES);
    const index = store.index('name');
    
    const existing = await new Promise<Category | undefined>((resolve, reject) => {
      const request = index.get(category.name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (existing) {
      // Já existe, não faz nada
      return;
    }
    
    // Não existe, adiciona
      await dbOperation(STORES.CATEGORIES, (store) => store.add(categoryWithUser));
  },

  updateCategory: async (id: string, updates: Partial<Category>): Promise<void> => {
    const database = await initDatabase();
    const transaction = database.transaction([STORES.CATEGORIES], 'readwrite');
    const store = transaction.objectStore(STORES.CATEGORIES);
    
    const getRequest = store.get(id);
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Categoria não encontrada'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  deleteCategory: async (id: string): Promise<void> => {
    await dbOperation(STORES.CATEGORIES, (store) => store.delete(id));
  },

  // Tags
  getTags: async (): Promise<Tag[]> => {
    await migrateOldDataToAdmin();
    const userId = getCurrentUserId();
    const allTags = await dbOperation<Tag[]>(STORES.TAGS, (store) => store.getAll());
    return allTags.filter((t: any) => t.userId === userId);
  },

  saveTags: async (tags: Tag[]): Promise<void> => {
    const userId = getCurrentUserId();
    const database = await initDatabase();
    
    // Primeiro, pega todas as tags
    const allTags = await new Promise<any[]>((resolve, reject) => {
      const transaction = database.transaction([STORES.TAGS], 'readonly');
      const store = transaction.objectStore(STORES.TAGS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Filtra apenas tags de outros usuários
    const otherUsersTags = allTags.filter((t: any) => t.userId && t.userId !== userId);
    
    // Limpa e reescreve tudo
    const transaction = database.transaction([STORES.TAGS], 'readwrite');
    const store = transaction.objectStore(STORES.TAGS);
    
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        const allToAdd = [
          ...otherUsersTags,
          ...tags.map(t => ({ ...t, userId } as any))
        ];
        
        if (allToAdd.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        allToAdd.forEach(tag => {
          const addRequest = store.add(tag);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === allToAdd.length) resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  },

  addTag: async (tag: Tag): Promise<void> => {
    const userId = getCurrentUserId();
    const tagWithUser = { ...tag, userId } as any;
    // Verifica se já existe antes de adicionar
    const database = await initDatabase();
    const transaction = database.transaction([STORES.TAGS], 'readonly');
    const store = transaction.objectStore(STORES.TAGS);
    const index = store.index('name');
    
    const existing = await new Promise<Tag | undefined>((resolve, reject) => {
      const request = index.get(tag.name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (existing) {
      // Já existe, não faz nada
      return;
    }
    
    // Não existe, adiciona
      await dbOperation(STORES.TAGS, (store) => store.add(tagWithUser));
  },

  updateTag: async (id: string, updates: Partial<Tag>): Promise<void> => {
    const database = await initDatabase();
    const transaction = database.transaction([STORES.TAGS], 'readwrite');
    const store = transaction.objectStore(STORES.TAGS);
    
    const getRequest = store.get(id);
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Tag não encontrada'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  deleteTag: async (id: string): Promise<void> => {
    await dbOperation(STORES.TAGS, (store) => store.delete(id));
  },

  // 13º Salário
  getThirteenthSalaries: async (): Promise<ThirteenthSalary[]> => {
    await migrateOldDataToAdmin();
    const userId = getCurrentUserId();
    const allSalaries = await dbOperation<ThirteenthSalary[]>(STORES.THIRTEENTH_SALARIES, (store) => store.getAll());
    return allSalaries.filter((s: any) => s.userId === userId);
  },

  saveThirteenthSalaries: async (salaries: ThirteenthSalary[]): Promise<void> => {
    const userId = getCurrentUserId();
    const database = await initDatabase();
    
    // Primeiro, pega todos os 13º salários
    const allSalaries = await new Promise<any[]>((resolve, reject) => {
      const transaction = database.transaction([STORES.THIRTEENTH_SALARIES], 'readonly');
      const store = transaction.objectStore(STORES.THIRTEENTH_SALARIES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Filtra apenas 13º salários de outros usuários
    const otherUsersSalaries = allSalaries.filter((s: any) => s.userId && s.userId !== userId);
    
    // Limpa e reescreve tudo
    const transaction = database.transaction([STORES.THIRTEENTH_SALARIES], 'readwrite');
    const store = transaction.objectStore(STORES.THIRTEENTH_SALARIES);
    
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        const allToAdd = [
          ...otherUsersSalaries,
          ...salaries.map(s => ({ ...s, userId } as any))
        ];
        
        if (allToAdd.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        allToAdd.forEach(salary => {
          const addRequest = store.add(salary);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === allToAdd.length) resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  },

  addThirteenthSalary: async (salary: ThirteenthSalary): Promise<void> => {
    await dbOperation(STORES.THIRTEENTH_SALARIES, (store) => store.add(salary));
  },

  updateThirteenthSalary: async (id: string, updates: Partial<ThirteenthSalary>): Promise<void> => {
    const database = await initDatabase();
    const transaction = database.transaction([STORES.THIRTEENTH_SALARIES], 'readwrite');
    const store = transaction.objectStore(STORES.THIRTEENTH_SALARIES);
    
    const getRequest = store.get(id);
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('13º salário não encontrado'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  deleteThirteenthSalary: async (id: string): Promise<void> => {
    await dbOperation(STORES.THIRTEENTH_SALARIES, (store) => store.delete(id));
  },

  // Pessoas
  getPeople: async (): Promise<Person[]> => {
    await migrateOldDataToAdmin();
    const userId = getCurrentUserId();
    const allPeople = await dbOperation<Person[]>(STORES.PEOPLE, (store) => store.getAll());
    return allPeople.filter((p: any) => p.userId === userId);
  },

  savePeople: async (people: Person[]): Promise<void> => {
    const userId = getCurrentUserId();
    const database = await initDatabase();
    
    // Primeiro, pega todas as pessoas
    const allPeople = await new Promise<any[]>((resolve, reject) => {
      const transaction = database.transaction([STORES.PEOPLE], 'readonly');
      const store = transaction.objectStore(STORES.PEOPLE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // Filtra apenas pessoas de outros usuários
    const otherUsersPeople = allPeople.filter((p: any) => p.userId && p.userId !== userId);
    
    // Limpa e reescreve tudo
    const transaction = database.transaction([STORES.PEOPLE], 'readwrite');
    const store = transaction.objectStore(STORES.PEOPLE);
    
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        const allToAdd = [
          ...otherUsersPeople,
          ...people.map(p => ({ ...p, userId } as any))
        ];
        
        if (allToAdd.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        allToAdd.forEach(person => {
          const addRequest = store.add(person);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === allToAdd.length) resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  },

  addPerson: async (person: Person): Promise<void> => {
    await dbOperation(STORES.PEOPLE, (store) => store.add(person));
  },

  updatePerson: async (id: string, updates: Partial<Person>): Promise<void> => {
    const database = await initDatabase();
    const transaction = database.transaction([STORES.PEOPLE], 'readwrite');
    const store = transaction.objectStore(STORES.PEOPLE);
    
    const getRequest = store.get(id);
    await new Promise<void>((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Pessoa não encontrada'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  deletePerson: async (id: string): Promise<void> => {
    await dbOperation(STORES.PEOPLE, (store) => store.delete(id));
  },
};

// Converte 13º salários existentes em transações de entrada
export const syncThirteenthSalariesToTransactions = async (addTransaction: (transaction: Omit<Transaction, 'id'>) => void): Promise<void> => {
  try {
    const salaries = await indexedDBStorage.getThirteenthSalaries();
    const transactions = await indexedDBStorage.getTransactions();
    
    for (const salary of salaries) {
      const entryDate = new Date(salary.entryDate);
      const installmentAmount = salary.amount / salary.installments;
      const daysBetween = 30;
      
      for (let i = 0; i < salary.installments; i++) {
        const installmentDate = new Date(entryDate);
        installmentDate.setDate(installmentDate.getDate() + (i * daysBetween));
        const dateStr = installmentDate.toISOString().split('T')[0];
        
        const description = salary.description 
          ? `${salary.description} - ${i + 1}ª parcela`
          : `13º Salário - ${i + 1}ª parcela`;
        
        // Verifica se já existe uma transação para esta parcela
        const exists = transactions.some(t => 
          t.type === 'income' &&
          t.category === '13º Salário' &&
          t.description === description &&
          t.date === dateStr
        );
        
        if (!exists) {
          const transaction: Omit<Transaction, 'id'> = {
            type: 'income',
            description,
            amount: installmentAmount,
            date: dateStr,
            category: '13º Salário',
            tags: ['13º Salário'],
          };
          addTransaction(transaction);
        }
      }
    }
    console.log(`✅ Sincronizados ${salaries.length} 13º salários com transações!`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar 13º salários:', error);
  }
};

// Limpa apenas as transações, mantendo categorias, tags, pessoas e 13º salários
export const clearAllTransactions = async (): Promise<void> => {
  try {
    await indexedDBStorage.saveTransactions([]);
    console.log('✅ Todas as transações foram apagadas!');
  } catch (error) {
    console.error('❌ Erro ao limpar transações:', error);
    throw error;
  }
};

// Expõe funções globalmente para execução via console
if (typeof window !== 'undefined') {
  (window as any).clearAllData = clearAllData;
  (window as any).clearLocalStorage = clearLocalStorage;
  (window as any).clearEverything = clearEverything;
  (window as any).clearAllTransactions = clearAllTransactions;
  
  console.log('💡 Funções disponíveis no console:');
  console.log('   - clearAllTransactions() - Apaga TODAS as transações');
  console.log('   - clearEverything() - Limpa TUDO (localStorage + IndexedDB)');
  console.log('   - clearAllData() - Limpa apenas IndexedDB');
  console.log('   - clearLocalStorage() - Limpa apenas localStorage');
}


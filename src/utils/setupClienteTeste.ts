import { indexedDBStorage, initDatabase } from './indexedDB';
import type { Transaction, Person, Category, Tag } from '../types';
import { defaultCategories, defaultTags } from '../data/initialData';

/**
 * Cria o usuário "teste" e popula com dados de out/2025 a mar/2026
 * Variação mensal: R$ 5.000 a R$ 40.000
 */
export const setupClienteTeste = async () => {
  try {
    console.log('🚀 Iniciando setup do cliente teste...');
    
    // Verifica se já foi executado
    const hasRun = localStorage.getItem('teste_setup_completed');
    if (hasRun === 'true') {
      console.log('✅ Setup já foi executado anteriormente.');
      return;
    }

    console.log('📊 Verificando dados existentes...');
    const existingTransactions = await indexedDBStorage.getTransactions();
    
    // Verifica se já tem dados COMPLETOS (receitas E despesas)
    const receitas = existingTransactions.filter(t => t.type === 'income');
    const despesas = existingTransactions.filter(t => t.type === 'expense');
    
    // Só considera completo se tiver pelo menos 50 transações, sendo 10+ receitas e 30+ despesas
    if (existingTransactions.length >= 50 && receitas.length >= 10 && despesas.length >= 30) {
      console.log(`✅ Dados já existem e estão completos (${existingTransactions.length} transações: ${receitas.length} receitas, ${despesas.length} despesas). Setup não necessário.`);
      localStorage.setItem('teste_setup_completed', 'true');
      return;
    }
    
    // Se dados incompletos, continua para criar/recriar
    if (existingTransactions.length > 0) {
      console.log(`⚠️ Dados incompletos encontrados (${existingTransactions.length} transações: ${receitas.length} receitas, ${despesas.length} despesas). Recriando...`);
    }
    
    console.log('📦 Criando novos dados do usuário teste...');

    const transactions: Transaction[] = [];

    // Configuração dos 6 meses (Out/Nov 2025 + Dez 2025 a Mar 2026)
    const months = [
      { month: '2025-10', name: 'Outubro 2025', incomeMultiplier: 0.85, expenseMultiplier: 0.75 },
      { month: '2025-11', name: 'Novembro 2025', incomeMultiplier: 0.90, expenseMultiplier: 0.80 },
      { month: '2025-12', name: 'Dezembro 2025', incomeMultiplier: 1.20, expenseMultiplier: 1.10 }, // Com 13º
      { month: '2026-01', name: 'Janeiro 2026', incomeMultiplier: 1.05, expenseMultiplier: 1.00 },
      { month: '2026-02', name: 'Fevereiro 2026', incomeMultiplier: 0.95, expenseMultiplier: 0.95 },
      { month: '2026-03', name: 'Março 2026', incomeMultiplier: 1.00, expenseMultiplier: 0.90 },
    ];

    // Pessoa fictícia
    const people: Person[] = [
      {
        id: crypto.randomUUID(),
        name: 'Cliente Teste',
        grossSalary: 15000.00,
        netSalary: 10500.00,
        thirteenthSalary: 5250.00,
        paymentDay: 5,
        userId: 'teste',
      },
    ];

    // Gera transações para cada mês
    months.forEach(({ month, name, incomeMultiplier, expenseMultiplier }, monthIndex) => {
      const [year, monthNum] = month.split('-');
      console.log(`💰 Gerando ${name}...`);

      // ===== RECEITAS =====
      
      // Salário principal
      const baseSalary = 10500 * incomeMultiplier;
      transactions.push({
        id: crypto.randomUUID(),
        type: 'income',
        description: 'Salário',
        amount: Math.round(baseSalary * 100) / 100,
        date: `${year}-${monthNum}-05`,
        category: 'Salário',
        tags: ['Recorrente', 'Trabalho'],
        userId: 'teste', // Associa ao usuário teste
      });

      // Renda extra (freelance/comissão)
      if (incomeMultiplier > 0.85) {
        const extraIncome = (3000 + Math.random() * 4000) * incomeMultiplier;
        transactions.push({
          id: crypto.randomUUID(),
          type: 'income',
          description: Math.random() > 0.5 ? 'Freelance' : 'Comissão',
          amount: Math.round(extraIncome * 100) / 100,
          date: `${year}-${monthNum}-15`,
          category: 'Freelance',
          tags: ['Freelance', 'Variável'],
        });
      }

      // 13º em dezembro
      if (month === '2025-12') {
        transactions.push({
          id: crypto.randomUUID(),
          type: 'income',
          description: '13º Salário',
          amount: 5250.00,
          date: `${year}-${monthNum}-20`,
          category: '13º Salário',
          tags: ['13º Salário'],
        });
      }

      // Bonificação ocasional
      if (monthIndex === 3) { // Janeiro
        transactions.push({
          id: crypto.randomUUID(),
          type: 'income',
          description: 'Bonificação',
          amount: 2800.00,
          date: `${year}-${monthNum}-10`,
          category: 'Bonificação',
          tags: ['Bonificação'],
        });
      }

      // ===== DESPESAS FIXAS =====
      
      const fixedExpenses = [
        { desc: 'Aluguel', amount: 2200, cat: 'Aluguel', tags: ['Recorrente', 'Moradia', 'Fixas'] },
        { desc: 'Condomínio', amount: 450, cat: 'Condomínio', tags: ['Recorrente', 'Moradia'] },
        { desc: 'IPTU', amount: 180, cat: 'IPTU', tags: ['Impostos'] },
        { desc: 'Energia Elétrica', amount: 200 + Math.random() * 100, cat: 'Energia Elétrica', tags: ['Recorrente', 'Contas'] },
        { desc: 'Água', amount: 80 + Math.random() * 50, cat: 'Água', tags: ['Recorrente', 'Contas'] },
        { desc: 'Internet', amount: 149.90, cat: 'Internet', tags: ['Recorrente', 'Contas'] },
        { desc: 'Celular', amount: 69.90, cat: 'Telefone', tags: ['Recorrente', 'Contas'] },
        { desc: 'Plano de Saúde', amount: 650, cat: 'Plano de Saúde', tags: ['Recorrente', 'Saúde'] },
        { desc: 'Academia', amount: 129.90, cat: 'Academia', tags: ['Recorrente', 'Saúde'] },
        { desc: 'Seguro Auto', amount: 280, cat: 'Seguros', tags: ['Recorrente'] },
      ];

      fixedExpenses.forEach(exp => {
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: exp.desc,
          amount: Math.round(exp.amount * expenseMultiplier * 100) / 100,
          date: `${year}-${monthNum}-01`,
          category: exp.cat,
          tags: exp.tags,
          status: 'open',
        });
      });

      // ===== DESPESAS VARIÁVEIS =====
      
      // Alimentação
      const foodExpenses = [
        { desc: 'Supermercado', base: 1200, variation: 400 },
        { desc: 'Restaurantes', base: 600, variation: 400 },
        { desc: 'Delivery', base: 300, variation: 200 },
        { desc: 'Padaria', base: 200, variation: 100 },
      ];

      foodExpenses.forEach(food => {
        const amount = (food.base + Math.random() * food.variation) * expenseMultiplier;
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: food.desc,
          amount: Math.round(amount * 100) / 100,
          date: `${year}-${monthNum}-${5 + Math.floor(Math.random() * 20)}`,
          category: food.desc,
          tags: ['Alimentação', 'Variáveis'],
          status: 'open',
        });
      });

      // Transporte
      const transportExpenses = [
        { desc: 'Combustível', base: 500, variation: 300 },
        { desc: 'Estacionamento', base: 250, variation: 150 },
        { desc: 'Uber/Táxi', base: 150, variation: 150 },
      ];

      transportExpenses.forEach(transport => {
        const amount = (transport.base + Math.random() * transport.variation) * expenseMultiplier;
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: transport.desc,
          amount: Math.round(amount * 100) / 100,
          date: `${year}-${monthNum}-${5 + Math.floor(Math.random() * 20)}`,
          category: transport.desc === 'Combustível' ? 'Combustível' : transport.desc === 'Estacionamento' ? 'Estacionamento' : 'Uber/Táxi',
          tags: ['Transporte', 'Variáveis'],
          status: 'open',
        });
      });

      // Lazer e Entretenimento
      const entertainmentBase = 800 * expenseMultiplier;
      transactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        description: 'Cinema e Shows',
        amount: Math.round((200 + Math.random() * 300) * expenseMultiplier * 100) / 100,
        date: `${year}-${monthNum}-${10 + Math.floor(Math.random() * 15)}`,
        category: 'Cinema',
        tags: ['Lazer', 'Variáveis'],
        status: 'open',
      });

      transactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        description: 'Streaming (Netflix, Spotify)',
        amount: 79.90,
        date: `${year}-${monthNum}-01`,
        category: 'TV/Streaming',
        tags: ['Lazer', 'Recorrente'],
        status: 'open',
      });

      transactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        description: 'Livros e Cursos',
        amount: Math.round((150 + Math.random() * 350) * expenseMultiplier * 100) / 100,
        date: `${year}-${monthNum}-${5 + Math.floor(Math.random() * 20)}`,
        category: 'Livros',
        tags: ['Educação', 'Variáveis'],
        status: 'open',
      });

      // Vestuário e Cuidados Pessoais
      const personalExpenses = [
        { desc: 'Roupas e Calçados', base: 400, variation: 800 },
        { desc: 'Farmácia', base: 150, variation: 200 },
        { desc: 'Cabeleireiro', base: 100, variation: 50 },
      ];

      personalExpenses.forEach(personal => {
        const amount = (personal.base + Math.random() * personal.variation) * expenseMultiplier;
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: personal.desc,
          amount: Math.round(amount * 100) / 100,
          date: `${year}-${monthNum}-${5 + Math.floor(Math.random() * 20)}`,
          category: personal.desc === 'Roupas e Calçados' ? 'Vestuário' : personal.desc === 'Farmácia' ? 'Farmácia' : 'Beleza',
          tags: ['Pessoal', 'Variáveis'],
          status: 'open',
        });
      });

      // Cartão de Crédito e Empréstimos
      transactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        description: 'Cartão de Crédito',
        amount: Math.round((1500 + Math.random() * 2000) * expenseMultiplier * 100) / 100,
        date: `${year}-${monthNum}-15`,
        category: 'Cartão de Crédito',
        tags: ['Cartão', 'Variáveis'],
        status: 'open',
      });

      transactions.push({
        id: crypto.randomUUID(),
        type: 'expense',
        description: 'Financiamento Veículo',
        amount: 1280.00,
        date: `${year}-${monthNum}-10`,
        category: 'Financiamento',
        tags: ['Parcelado', 'Recorrente'],
        status: 'open',
        installment: { current: monthIndex + 24, total: 48 },
      });

      // Despesas especiais por mês
      if (month === '2025-12') {
        // Dezembro: Natal
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: 'Presentes de Natal',
          amount: 2200.00,
          date: `${year}-${monthNum}-18`,
          category: 'Presentes',
          tags: ['Presentes', 'Natal'],
          status: 'open',
        });
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: 'Ceia de Natal',
          amount: 850.00,
          date: `${year}-${monthNum}-22`,
          category: 'Alimentação',
          tags: ['Alimentação', 'Natal'],
          status: 'open',
        });
      }

      if (month === '2026-01') {
        // Janeiro: IPTU
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: 'IPTU Anual',
          amount: 1980.00,
          date: `${year}-${monthNum}-08`,
          category: 'IPTU',
          tags: ['Impostos', 'Anual'],
          status: 'open',
        });
      }

      if (month === '2026-02') {
        // Fevereiro: Carnaval
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: 'Viagem Carnaval',
          amount: 2400.00,
          date: `${year}-${monthNum}-25`,
          category: 'Viagem',
          tags: ['Lazer', 'Viagem'],
          status: 'open',
        });
      }

      // Investimento mensal (varia)
      if (incomeMultiplier > 0.90) {
        const investAmount = (2000 + Math.random() * 3000) * incomeMultiplier;
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: 'Investimento',
          amount: Math.round(investAmount * 100) / 100,
          date: `${year}-${monthNum}-06`,
          category: 'Investimentos',
          tags: ['Investimento', 'Planejado'],
          status: 'open',
        });
      }
    });

    // Adiciona userId a todas as transações
    console.log('👤 Associando transações ao usuário teste...');
    transactions.forEach(t => {
      t.userId = 'teste';
    });

    // Adiciona categorias e tags
    console.log('📁 Adicionando categorias e tags...');
    for (const cat of defaultCategories) {
      await indexedDBStorage.addCategory({
        ...cat,
        id: crypto.randomUUID(),
        userId: 'teste',
      });
    }

    for (const tag of defaultTags) {
      await indexedDBStorage.addTag({
        ...tag,
        id: crypto.randomUUID(),
        userId: 'teste',
      });
    }

    // Salva transações uma por uma
    console.log(`💾 Salvando ${transactions.length} transações...`);
    const db = await initDatabase();
    
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.put(transaction);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      if (i % 20 === 0) {
        console.log(`   ✅ ${i}/${transactions.length} transações salvas...`);
      }
    }
    console.log(`   ✅ Todas as ${transactions.length} transações salvas!`);
    
    // Salva pessoas
    console.log('💾 Salvando pessoa...');
    for (const person of people) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['people'], 'readwrite');
        const store = tx.objectStore('people');
        const request = store.put(person);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    // Marca como concluído
    localStorage.setItem('teste_setup_completed', 'true');

    console.log(`\n✅ Setup concluído! ${transactions.length} transações criadas.`);
    console.log(`👤 Usuário: teste / Senha: teste123`);
    
    // Resumo por mês
    console.log('\n📊 Resumo Financeiro:\n');
    const byMonth = transactions.reduce((acc, t) => {
      const m = t.date.substring(0, 7);
      if (!acc[m]) acc[m] = { income: [], expense: [] };
      acc[m][t.type].push(t);
      return acc;
    }, {} as Record<string, { income: Transaction[]; expense: Transaction[] }>);

    Object.entries(byMonth).sort().forEach(([m, data]) => {
      const totalIn = data.income.reduce((sum, t) => sum + t.amount, 0);
      const totalOut = data.expense.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIn - totalOut;
      console.log(`📅 ${m}: Receitas R$ ${totalIn.toFixed(2)} | Despesas R$ ${totalOut.toFixed(2)} | Saldo R$ ${balance.toFixed(2)}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    return false;
  }
};


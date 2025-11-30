import { indexedDBStorage } from './indexedDB';
import type { Transaction, Person, Category, Tag } from '../types';
import { defaultCategories, defaultTags } from '../data/initialData';

/**
 * Popula o banco de dados com dados históricos e projeções futuras
 * Apaga o banco atual e cria um novo com dados de Dezembro 2025 até Março 2026
 * Calcula automaticamente parcelas progressivas e inclui gastos fixos em todos os meses
 */
export const populateDatabase = async () => {
  try {
    console.log('🧹 Limpando banco de dados anterior...');
    // Limpa o IndexedDB
    await indexedDBStorage.saveTransactions([]);
    await indexedDBStorage.saveCategories([]);
    await indexedDBStorage.saveTags([]);
    await indexedDBStorage.saveThirteenthSalaries([]);
    await indexedDBStorage.savePeople([]);
    console.log('✅ Banco limpo com sucesso!');
    
    const transactions: Transaction[] = [];
    
    // Gastos fixos (recorrentes) - mesmos valores todos os meses (exceto dezembro que tem estrutura diferente)
    const fixedExpenses = [
      { description: 'Aluguel', amount: 1200.00, category: 'Moradia', tags: ['Recorrente', 'Urgente'], priority: 'high' as const },
      { description: 'Hildo', amount: 1200.00, category: 'Empréstimos', tags: ['Pessoal'] },
      { description: 'Internet', amount: 112.76, category: 'Contas', tags: ['Recorrente'] },
      { description: 'Telefone', amount: 54.27, category: 'Contas', tags: ['Recorrente'] },
      { description: 'Água', amount: 56.36, category: 'Contas', tags: ['Recorrente'] },
      { description: 'Luz', amount: 12.26, category: 'Contas', tags: ['Recorrente'] },
      { description: 'Mercearia', amount: 220.00, category: 'Alimentação', tags: [] },
    ];

    // Configuração base de parcelas (dezembro 2025 - dados fornecidos pelo usuário)
    const baseInstallments = [
      { description: 'Celular', amount: 202.00, category: 'Contas', tags: ['Parcelado', 'Recorrente'], decemberCurrent: 8, total: 10 },
      { description: 'Fran', amount: 100.00, category: 'Empréstimos', tags: ['Pessoal'], decemberCurrent: 1, total: 1, isMonthly: true },
      { description: 'Paula', amount: 500.00, category: 'Empréstimos', tags: ['Pessoal'], decemberCurrent: 1, total: 1, isMonthly: true },
      { description: 'Priscila', amount: 505.00, category: 'Empréstimos', tags: ['Pessoal'], decemberCurrent: 3, total: 3 },
      { description: 'Itaú', amount: 78.14, category: 'Empréstimos', tags: ['Parcelado'], decemberCurrent: 10, total: 13 },
      { description: 'Davi', amount: 1000.00, category: 'Empréstimos', tags: ['Pessoal'], decemberCurrent: 5, total: 5 },
      { description: 'Óculos', amount: 375.00, category: 'Saúde', tags: ['Parcelado'], decemberCurrent: 4, total: 4 },
      { description: 'Fabi', amount: 500.00, category: 'Empréstimos', tags: ['Pessoal'], decemberCurrent: 2, total: 3 },
    ];

    // Dados históricos de dezembro 2025
    const historicalData: Record<string, Array<{ description: string; amount: number; category: string; tags: string[]; current?: number; total?: number }>> = {
      '2025-12': [
        { description: 'Celular', amount: 202.00, category: 'Contas', tags: ['Parcelado', 'Recorrente'], current: 8, total: 10 },
        { description: 'Fran', amount: 100.00, category: 'Empréstimos', tags: ['Pessoal'], current: 1, total: 1 },
        { description: 'Paula', amount: 500.00, category: 'Empréstimos', tags: ['Pessoal'], current: 1, total: 1 },
        { description: 'Priscila', amount: 505.00, category: 'Empréstimos', tags: ['Pessoal'], current: 3, total: 3 },
        { description: 'Itaú', amount: 78.14, category: 'Empréstimos', tags: ['Parcelado'], current: 10, total: 13 },
        { description: 'Davi', amount: 1000.00, category: 'Empréstimos', tags: ['Pessoal'], current: 5, total: 5 },
        { description: 'Óculos', amount: 375.00, category: 'Saúde', tags: ['Parcelado'], current: 4, total: 4 },
        { description: 'Fabi', amount: 500.00, category: 'Empréstimos', tags: ['Pessoal'], current: 2, total: 3 },
      ],
    };

    // Função para calcular parcelas de um mês específico (para meses futuros)
    const getInstallmentsForMonth = (yearMonth: string) => {
      // Se tem dados históricos, usa eles
      if (historicalData[yearMonth]) {
        return historicalData[yearMonth];
      }

      // Para meses futuros, calcula baseado em dezembro 2025
      const [year, month] = yearMonth.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      const decemberDate = new Date(2025, 11, 1); // Dezembro 2025
      const monthsDiff = (monthDate.getFullYear() - decemberDate.getFullYear()) * 12 + (monthDate.getMonth() - decemberDate.getMonth());

      return baseInstallments
        .map(inst => {
          let currentInst = inst.decemberCurrent + monthsDiff;
          
          // Se é mensal (como Fran, Paula), sempre mostra como parcela 1
          if (inst.isMonthly) {
            currentInst = 1;
          }
          
          // Se a parcela já passou do total, não inclui
          if (currentInst > inst.total) {
            return null;
          }
          
          return {
            description: inst.description,
            amount: inst.amount,
            category: inst.category,
            tags: inst.tags,
            current: currentInst,
            total: inst.total,
          };
        })
        .filter((inst): inst is NonNullable<typeof inst> => inst !== null);
    };

    // Gera meses: Dezembro 2025 até Março 2026
    const months: Array<{ month: string; status: 'paid' | 'open'; label: string }> = [];
    
    // Dezembro 2025 (em aberto)
    months.push({
      month: '2025-12',
      status: 'open',
      label: 'Dezembro',
    });
    
    // Meses futuros (2026) - Janeiro, Fevereiro e Março
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    for (let month = 1; month <= 3; month++) {
      months.push({
        month: `2026-${String(month).padStart(2, '0')}`,
        status: 'open',
        label: monthNames[month - 1],
      });
    }

    // Entradas (receitas) de dezembro 2025
    const decemberIncome = [
      { description: 'Gabrielle - Salário', amount: 1400.00, category: 'Salário', tags: ['Recorrente', 'Trabalho'] },
      { description: 'Gabrielle - 13º Salário', amount: 1283.33, category: '13º Salário', tags: ['13º Salário'] },
      { description: 'Gabrielle - Pensão', amount: 400.00, category: 'Salário', tags: ['Recorrente', 'Família'] },
      { description: 'Wellington - Salário', amount: 3750.00, category: 'Salário', tags: ['Recorrente', 'Trabalho'] },
      { description: 'Wellington - Salário Retroativo', amount: 1233.33, category: 'Salário', tags: ['Trabalho'] },
      { description: 'Wellington - 13º Salário', amount: 616.66, category: '13º Salário', tags: ['13º Salário'] },
    ];

    months.forEach(({ month, status }) => {
      const [year, monthNum] = month.split('-');
      
      // Adiciona entradas APENAS em dezembro 2025 (2025-12)
      if (month === '2025-12') {
        console.log(`💰 Adicionando ${decemberIncome.length} entradas em dezembro 2025`);
        decemberIncome.forEach(income => {
          const incomeDate = `${year}-${monthNum}-05`; // Dia 5 (dia do pagamento)
          transactions.push({
            id: crypto.randomUUID(),
            type: 'income',
            description: income.description,
            amount: income.amount,
            date: incomeDate,
            category: income.category,
            tags: income.tags,
          });
          console.log(`   ✅ ${income.description}: R$ ${income.amount.toFixed(2)} em ${incomeDate}`);
        });
      }
      
      // Adiciona gastos fixos em todos os meses (dia 5 para evitar problemas de timezone)
      fixedExpenses.forEach(expense => {
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: expense.description,
          amount: expense.amount,
          date: `${year}-${monthNum}-05`,
          category: expense.category,
          tags: expense.tags,
          status: status,
          priority: expense.priority,
        });
      });

      // Adiciona parcelas do mês (calculadas automaticamente) - dia 5 para evitar problemas de timezone
      const monthInstallments = getInstallmentsForMonth(month);
      monthInstallments.forEach(inst => {
        transactions.push({
          id: crypto.randomUUID(),
          type: 'expense',
          description: inst.description,
          amount: inst.amount,
          date: `${year}-${monthNum}-05`,
          category: inst.category,
          tags: inst.tags,
          status: status,
          priority: inst.description === 'Aluguel' ? 'high' : undefined,
          installment: inst.current && inst.total ? {
            current: inst.current,
            total: inst.total,
          } : undefined,
        });
      });
    });

    // Cadastra Wellington e Gabrielle
    const people: Person[] = [
      {
        id: crypto.randomUUID(),
        name: 'Wellington',
        grossSalary: 4500.00, // Valor aproximado (bruto)
        netSalary: 3750.00, // Salário líquido
        thirteenthSalary: 616.66, // 13º salário
        paymentDay: 5, // Dia 5 de cada mês
      },
      {
        id: crypto.randomUUID(),
        name: 'Gabrielle',
        grossSalary: 1800.00, // Valor aproximado (bruto)
        netSalary: 1400.00, // Salário líquido
        thirteenthSalary: 1283.33, // 13º salário
        paymentDay: 5, // Dia 5 de cada mês
      },
    ];

    // Adiciona categorias e tags que não existem (usando addCategory/addTag que já verifica duplicatas)
    const existingCategories = await indexedDBStorage.getCategories();
    const existingTags = await indexedDBStorage.getTags();
    
    const categoriesToAdd = defaultCategories.filter(
      defaultCat => !existingCategories.some(existing => existing.name === defaultCat.name)
    );
    const tagsToAdd = defaultTags.filter(
      defaultTag => !existingTags.some(existing => existing.name === defaultTag.name)
    );
    
    // Adiciona categorias uma por uma usando addCategory (que usa put e não dá erro de duplicata)
    for (const cat of categoriesToAdd) {
      const newCategory: Category = {
        ...cat,
        id: crypto.randomUUID(),
      };
      await indexedDBStorage.addCategory(newCategory);
    }
    if (categoriesToAdd.length > 0) {
      console.log(`📁 ${categoriesToAdd.length} novas categorias adicionadas!`);
    }
    
    // Adiciona tags uma por uma usando addTag (que usa put e não dá erro de duplicata)
    for (const tag of tagsToAdd) {
      const newTag: Tag = {
        ...tag,
        id: crypto.randomUUID(),
      };
      await indexedDBStorage.addTag(newTag);
    }
    if (tagsToAdd.length > 0) {
      console.log(`🏷️ ${tagsToAdd.length} novas tags adicionadas!`);
    }

    // Salva todas as transações usando IndexedDB
    await indexedDBStorage.saveTransactions(transactions);
    
    // Salva as pessoas
    await indexedDBStorage.savePeople(people);
    
    console.log(`✅ Banco populado com ${transactions.length} transações!`);
    console.log(`👥 ${people.length} pessoas cadastradas: ${people.map(p => p.name).join(', ')}`);
    console.log(`📊 Distribuição por mês:`);
    
    // Agrupa por mês e tipo
    const transactionsByMonth = transactions.reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      if (!acc[month]) acc[month] = { income: [], expense: [] };
      if (t.type === 'income') {
        acc[month].income.push(t);
      } else {
        acc[month].expense.push(t);
      }
      return acc;
    }, {} as Record<string, { income: typeof transactions; expense: typeof transactions }>);
    
    Object.entries(transactionsByMonth)
      .sort()
      .forEach(([month, data]) => {
        const status = data.expense[0]?.status === 'paid' ? 'pago' : 'em aberto';
        const totalIncome = data.income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = data.expense.reduce((sum, t) => sum + t.amount, 0);
        console.log(`   📅 ${month}:`);
        console.log(`      💰 ${data.income.length} entradas: R$ ${totalIncome.toFixed(2)}`);
        console.log(`      💸 ${data.expense.length} despesas: R$ ${totalExpense.toFixed(2)} (${status})`);
      });
    
    return transactions.length;
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    throw error;
  }
};

// Script removido - não executa mais automaticamente
// O banco de dados deve ser preenchido manualmente pelo usuário


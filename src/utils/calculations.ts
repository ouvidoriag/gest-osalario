import type { Transaction, MonthlyProjection } from '../types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateTotal = (transactions: Transaction[], type: 'income' | 'expense', includePaid: boolean = true): number => {
  return transactions
    .filter(t => {
      if (t.type !== type) return false;
      // Para despesas, se includePaid for false, só conta as não pagas
      if (type === 'expense' && !includePaid) {
        return t.status !== 'paid';
      }
      return true;
    })
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateBalance = (transactions: Transaction[]): number => {
  const income = calculateTotal(transactions, 'income');
  const expenses = calculateTotal(transactions, 'expense');
  return income - expenses;
};

export const getMonthlyProjections = (transactions: Transaction[]): MonthlyProjection[] => {
  if (transactions.length === 0) return [];
  
  try {
    const dates = transactions
      .map(t => {
        const date = new Date(t.date);
        // Valida se a data é válida
        if (isNaN(date.getTime())) {
          console.warn(`Data inválida encontrada: ${t.date}`);
          return null;
        }
        return date;
      })
      .filter((d): d is Date => d !== null);
    
    if (dates.length === 0) return [];
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Adiciona o mês atual se não estiver no intervalo
    const now = new Date();
    const finalMinDate = minDate < now ? minDate : startOfMonth(now);
    const finalMaxDate = maxDate > now ? maxDate : endOfMonth(now);
    
    const months = eachMonthOfInterval({ start: finalMinDate, end: finalMaxDate });
    
    return months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        try {
          const date = new Date(t.date);
          if (isNaN(date.getTime())) return false;
          return date >= start && date <= end;
        } catch {
          return false;
        }
      });
      
      const income = calculateTotal(monthTransactions, 'income');
      const expenses = calculateTotal(monthTransactions, 'expense');
      
      return {
        month: format(month, 'MMMM yyyy', { locale: ptBR }),
        income,
        expenses,
        balance: income - expenses,
      };
    });
  } catch (error) {
    console.error('Erro ao calcular projeção mensal:', error);
    return [];
  }
};

export const getTransactionsByCategory = (transactions: Transaction[]) => {
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    const current = categoryMap.get(transaction.category) || 0;
    categoryMap.set(transaction.category, current + transaction.amount);
  });
  
  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
};

export const getTransactionsByTag = (transactions: Transaction[]) => {
  const tagMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    transaction.tags.forEach(tag => {
      const current = tagMap.get(tag) || 0;
      tagMap.set(tag, current + transaction.amount);
    });
  });
  
  return Array.from(tagMap.entries()).map(([tag, amount]) => ({
    tag,
    amount,
  }));
};


import type { Transaction } from '../types';
import { subDays, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, format } from 'date-fns';

export type PeriodFilter = '7days' | '30days' | 'month';

export interface DateFilterState {
  period: PeriodFilter;
  monthOffset: number; // 0 = mês atual, -1 = mês anterior, 1 = próximo mês
}

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: PeriodFilter,
  monthOffset: number = 0
): Transaction[] => {
  const baseDate = new Date();
  const targetDate = monthOffset !== 0 ? addMonths(baseDate, monthOffset) : baseDate;
  
  let startDate: Date;
  let endDate: Date = targetDate;

  switch (period) {
    case '7days':
      startDate = subDays(targetDate, 7);
      break;
    case '30days':
      startDate = subDays(targetDate, 30);
      break;
    case 'month':
      startDate = startOfMonth(targetDate);
      endDate = endOfMonth(targetDate);
      break;
    default:
      return transactions;
  }

  return transactions.filter(transaction => {
    try {
      const transactionDate = new Date(transaction.date);
      if (isNaN(transactionDate.getTime())) return false;
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    } catch {
      return false;
    }
  });
};

export const getPeriodLabel = (period: PeriodFilter, monthOffset: number = 0): string => {
  if (period === 'month') {
    const baseDate = new Date();
    const targetDate = monthOffset !== 0 ? addMonths(baseDate, monthOffset) : baseDate;
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }
  return period === '7days' ? 'Últimos 7 dias' : 'Últimos 30 dias';
};


import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { calculateTotal, calculateBalance, formatCurrency } from '../utils/calculations';
import type { Transaction } from '../types';
import { isBefore } from 'date-fns';

interface SummaryCardsProps {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  currentPeriodStart?: Date;
}

export const SummaryCards = ({ transactions, allTransactions = [], currentPeriodStart }: SummaryCardsProps) => {
  const income = calculateTotal(transactions, 'income');
  const expenses = calculateTotal(transactions, 'expense');
  const currentBalance = calculateBalance(transactions);

  // Calcula o saldo acumulado dos meses anteriores
  let previousBalance = 0;
  if (currentPeriodStart && allTransactions.length > 0) {
    // Filtra transações anteriores ao período atual
    const previousTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return isBefore(transactionDate, currentPeriodStart);
    });

    const previousIncome = previousTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const previousExpenses = previousTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    previousBalance = previousIncome - previousExpenses;
  }

  // Saldo total = saldo do período atual + saldo acumulado anterior
  const balance = currentBalance + previousBalance;

  const getBalanceColor = () => {
    if (balance < 0) return 'from-red-500 to-red-600';
    if (balance <= 1000) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Entradas</h3>
          <TrendingUp size={24} />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(income)}</p>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Saídas</h3>
          <TrendingDown size={24} />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(expenses)}</p>
      </div>

      <div className={`bg-gradient-to-br ${getBalanceColor()} rounded-xl p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Saldo</h3>
          <Wallet size={24} />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
        {previousBalance !== 0 && (
          <div className="mt-2 text-xs opacity-90">
            <div>Período: {formatCurrency(currentBalance)}</div>
            <div>Acumulado: {formatCurrency(previousBalance)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { Priority } from '../types';
import type { PeriodFilter } from '../utils/dateFilter';

interface PaymentPriorityProps {
  periodFilter?: PeriodFilter;
  monthOffset?: number;
}

export const PaymentPriority = ({ periodFilter = 'month', monthOffset = 0 }: PaymentPriorityProps) => {
  const { transactions } = useFinance();

  const getPriorityIcon = (priority?: Priority) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />;
      case 'medium': return <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />;
      case 'low': return <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />;
      default: return null;
    }
  };

  const getMonthlyExpenses = () => {
    // Calcula o mês baseado no filtro e offset
    const now = new Date();
    const targetDate = periodFilter === 'month' ? addMonths(now, monthOffset) : now;
    const currentMonthStart = startOfMonth(targetDate);
    const currentMonthEnd = endOfMonth(targetDate);

    // Filtra todas as despesas do mês selecionado com status 'open'
    const monthExpenses = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.status === 'open' && // Apenas despesas em aberto
        isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
      );

    // Agrupa despesas por descrição para evitar duplicatas
    const groupedExpenses = monthExpenses.reduce((acc, expense) => {
      if (!acc[expense.description]) {
        acc[expense.description] = { ...expense, id: expense.id };
      }
      return acc;
    }, {} as Record<string, typeof monthExpenses[0]>);

    // Ordena do mais caro para o mais barato
    const sortedExpenses = Object.values(groupedExpenses).sort((a, b) => b.amount - a.amount);

    const total = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      expenses: sortedExpenses,
      total,
      month: format(targetDate, "MMMM 'de' yyyy", { locale: ptBR }),
    };
  };

  const monthData = getMonthlyExpenses();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Despesas do Mês</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{monthData.month}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total em Aberto</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(monthData.total)}</p>
        </div>
      </div>
      
      {monthData.expenses.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma despesa em aberto neste mês</p>
      ) : (
        <div className="space-y-2">
          {monthData.expenses.map((expense, index) => {
            const priorityInfo = getPriorityIcon(expense.priority);
            const PriorityIcon = priorityInfo;
            
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  borderLeftColor: index === 0 ? '#ef4444' : index < 3 ? '#f59e0b' : '#6b7280',
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{expense.description}</h3>
                      {expense.installment && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded">
                          {expense.installment.current}/{expense.installment.total}
                        </span>
                      )}
                      {expense.priority && PriorityIcon && (
                        <span className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                          style={{
                            backgroundColor: expense.priority === 'high' ? '#fee2e2' : 
                                           expense.priority === 'medium' ? '#fef3c7' : '#dbeafe',
                            color: expense.priority === 'high' ? '#dc2626' : 
                                  expense.priority === 'medium' ? '#d97706' : '#2563eb',
                          }}
                        >
                          {PriorityIcon}
                          {expense.priority === 'high' ? 'Alta' : expense.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>{format(new Date(expense.date), "dd/MM/yyyy")}</span>
                      <span>•</span>
                      <span className="font-medium">{expense.category}</span>
                      {expense.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {expense.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {expense.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{expense.tags.length - 2}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {((expense.amount / monthData.total) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

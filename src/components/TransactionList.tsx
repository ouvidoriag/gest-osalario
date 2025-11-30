import { useState } from 'react';
import { Edit, Trash2, Plus, AlertCircle, Clock, CheckCircle, Check, X, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionForm } from './TransactionForm';
import type { Transaction, Priority, PaymentStatus } from '../types';

interface TransactionListProps {
  transactions?: Transaction[];
}

export const TransactionList = ({ transactions: propTransactions }: TransactionListProps = {}) => {
  const { transactions: contextTransactions, deleteTransaction, updateTransaction, categories, tags } = useFinance();
  const transactions = propTransactions || contextTransactions;
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');

  const filteredTransactions = transactions
    .filter(t => {
      const typeMatch = filterType === 'all' || t.type === filterType;
      const statusMatch = filterStatus === 'all' || (t.type === 'expense' && t.status === filterStatus) || t.type === 'income';
      return typeMatch && statusMatch;
    })
    .sort((a, b) => {
      // Ordena por status primeiro (overdue, open, paid), depois por data
      const statusOrder = { overdue: 0, open: 1, paid: 2 };
      const aStatus = a.type === 'expense' ? (a.status || 'open') : 'paid';
      const bStatus = b.type === 'expense' ? (b.status || 'open') : 'paid';
      const statusDiff = (statusOrder[aStatus as keyof typeof statusOrder] || 1) - (statusOrder[bStatus as keyof typeof statusOrder] || 1);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleEdit = (transaction: Transaction) => {
    console.log('Editando transação:', transaction);
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deletando transação:', id);
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id);
      console.log('Transação deletada com sucesso');
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color || '#6b7280';
  };

  const getPriorityInfo = (priority?: Priority) => {
    switch (priority) {
      case 'high':
        return { icon: AlertCircle, label: 'Alta', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900' };
      case 'medium':
        return { icon: Clock, label: 'Média', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900' };
      case 'low':
        return { icon: CheckCircle, label: 'Baixa', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900' };
      default:
        return null;
    }
  };

  const getStatusInfo = (status?: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return { 
          icon: Check, 
          label: 'Paga', 
          color: 'text-green-600 dark:text-green-400', 
          bg: 'bg-green-100 dark:bg-green-900',
          border: 'border-green-500'
        };
      case 'overdue':
        return { 
          icon: X, 
          label: 'Atraso', 
          color: 'text-red-600 dark:text-red-400', 
          bg: 'bg-red-100 dark:bg-red-900',
          border: 'border-red-500'
        };
      case 'open':
      default:
        return { 
          icon: Clock, 
          label: 'Em Aberto', 
          color: 'text-yellow-600 dark:text-yellow-400', 
          bg: 'bg-yellow-100 dark:bg-yellow-900',
          border: 'border-yellow-500'
        };
    }
  };

  const handleStatusChange = (id: string, newStatus: PaymentStatus) => {
    console.log('Mudando status da transação:', id, 'para', newStatus);
    updateTransaction(id, { status: newStatus });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transações</h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todas</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          {filterType === 'expense' || filterType === 'all' ? (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Em Aberto</option>
              <option value="paid">Paga</option>
              <option value="overdue">Atraso</option>
            </select>
          ) : null}
          <button
            onClick={() => {
              setEditingTransaction(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Nova Transação
          </button>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(undefined);
          }}
        />
      )}

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma transação encontrada</p>
        ) : (
          filteredTransactions.map(transaction => {
            const priorityInfo = getPriorityInfo(transaction.priority);
            const PriorityIcon = priorityInfo?.icon;
            const statusInfo = transaction.type === 'expense' ? getStatusInfo(transaction.status || 'open') : null;
            const StatusIcon = statusInfo?.icon;
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border-l-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border dark:border-gray-700"
                style={transaction.type === 'expense' && statusInfo ? {
                  borderLeftColor: statusInfo.border.includes('green') ? '#10b981' : 
                                  statusInfo.border.includes('red') ? '#ef4444' : '#f59e0b',
                  borderLeftWidth: '4px'
                } : { borderLeftColor: 'transparent' }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h3>
                    {transaction.installment && (
                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                        {transaction.installment.current}/{transaction.installment.total}
                      </span>
                    )}
                    {priorityInfo && (
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${priorityInfo.bg} ${priorityInfo.color}`}>
                        {PriorityIcon && <PriorityIcon size={12} />}
                        {priorityInfo.label}
                      </span>
                    )}
                    {statusInfo && (
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color} font-medium`}>
                        {StatusIcon && <StatusIcon size={12} />}
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <span>{format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    <span className="font-medium" style={{ color: getCategoryColor(transaction.category) }}>
                      {transaction.category}
                    </span>
                    {transaction.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {transaction.tags.map(tag => {
                          const tagColor = getTagColor(tag);
                          return (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: tagColor + '15',
                                color: tagColor,
                                borderColor: tagColor + '40',
                              }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className={`text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  {transaction.type === 'expense' && (
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(transaction.id, 'paid');
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          transaction.status === 'paid'
                            ? 'bg-green-500 text-white'
                            : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
                        }`}
                        title="Marcar como Paga"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(transaction.id, 'open');
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          transaction.status === 'open' || !transaction.status
                            ? 'bg-yellow-500 text-white'
                            : 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                        }`}
                        title="Marcar como Em Aberto"
                      >
                        <Clock size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(transaction.id, 'overdue');
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          transaction.status === 'overdue'
                            ? 'bg-red-500 text-white'
                            : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900'
                        }`}
                        title="Marcar como Atraso"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(transaction);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(transaction.id);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


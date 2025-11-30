import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Transaction, TransactionType, Priority, PaymentStatus } from '../types';
import { useFinance } from '../context/FinanceContext';

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
}

export const TransactionForm = ({ transaction, onClose }: TransactionFormProps) => {
  const { addTransaction, updateTransaction, categories, tags } = useFinance();
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    tags: [] as string[],
    priority: '' as Priority | '',
    status: 'open' as PaymentStatus | '',
    installmentCurrent: '',
    installmentTotal: '',
    isRecurring: false,
    recurringMonths: 12,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        category: transaction.category,
        tags: transaction.tags,
        priority: transaction.priority || '',
        status: (transaction.type === 'expense' ? (transaction.status || 'open') : '') as PaymentStatus | '',
        installmentCurrent: transaction.installment?.current.toString() || '',
        installmentTotal: transaction.installment?.total.toString() || '',
        isRecurring: transaction.isRecurring || false,
        recurringMonths: transaction.recurringMonths || 12,
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData: Omit<Transaction, 'id'> = {
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      tags: formData.tags,
      ...(formData.priority && { priority: formData.priority as Priority }),
      ...(formData.type === 'expense' && formData.status && { status: formData.status as PaymentStatus }),
      ...(formData.installmentCurrent && formData.installmentTotal && {
        installment: {
          current: parseInt(formData.installmentCurrent),
          total: parseInt(formData.installmentTotal),
        },
      }),
      isRecurring: formData.isRecurring,
      recurringMonths: formData.recurringMonths,
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    onClose();
  };

  const toggleTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const availableCategories = categories.filter(c => c.type === formData.type);
  const availableTags = tags.map(t => t.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo</label>
            <div className="flex gap-4">
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType, category: '' })}
                  className="mr-2"
                />
                Despesa
              </label>
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType, category: '' })}
                  className="mr-2"
                />
                Receita
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Valor</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecione uma categoria</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const tagData = tags.find(t => t.name === tag);
                const isSelected = formData.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={isSelected && tagData ? { backgroundColor: tagData.color } : {}}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {formData.type === 'expense' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority | '' })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sem prioridade</option>
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus | '' })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="open">Em Aberto</option>
                  <option value="paid">Paga</option>
                  <option value="overdue">Atraso (pagar mês que vem)</option>
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Parcela Atual (opcional)</label>
              <input
                type="number"
                value={formData.installmentCurrent}
                onChange={(e) => setFormData({ ...formData, installmentCurrent: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Total de Parcelas (opcional)</label>
              <input
                type="number"
                value={formData.installmentTotal}
                onChange={(e) => setFormData({ ...formData, installmentTotal: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                🔄 Transação Recorrente (repete todos os meses)
              </span>
            </label>
            
            {formData.isRecurring && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Por:</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.recurringMonths}
                  onChange={(e) => setFormData({ ...formData, recurringMonths: parseInt(e.target.value) || 12 })}
                  className="w-20 px-3 py-1 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">meses</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {formData.isRecurring 
                ? `🔄 ${transaction ? 'Atualizar' : 'Adicionar'} Recorrente`
                : transaction ? 'Atualizar' : 'Adicionar'
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


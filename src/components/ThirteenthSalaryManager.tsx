import { useState } from 'react';
import { Plus, Edit, Trash2, X, Calculator, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import { format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ThirteenthSalary } from '../types';

export const ThirteenthSalaryManager = () => {
  const { thirteenthSalaries, addThirteenthSalary, updateThirteenthSalary, deleteThirteenthSalary } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<ThirteenthSalary | undefined>();
  const [formData, setFormData] = useState({
    amount: '',
    entryDate: new Date().toISOString().split('T')[0],
    installments: '2',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryData = {
      amount: parseFloat(formData.amount),
      entryDate: formData.entryDate,
      installments: parseInt(formData.installments),
      description: formData.description || undefined,
    };

    if (editingSalary) {
      updateThirteenthSalary(editingSalary.id, salaryData);
    } else {
      addThirteenthSalary(salaryData);
    }
    setShowForm(false);
    setEditingSalary(undefined);
    setFormData({ amount: '', entryDate: new Date().toISOString().split('T')[0], installments: '2', description: '' });
  };

  const handleEdit = (salary: ThirteenthSalary) => {
    setEditingSalary(salary);
    setFormData({
      amount: salary.amount.toString(),
      entryDate: salary.entryDate,
      installments: salary.installments.toString(),
      description: salary.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este décimo terceiro?')) {
      deleteThirteenthSalary(id);
    }
  };

  const calculateInstallments = (salary: ThirteenthSalary) => {
    const entryDate = new Date(salary.entryDate);
    const installmentAmount = salary.amount / salary.installments;
    const daysBetween = 30; // Aproximadamente 30 dias entre parcelas

    return Array.from({ length: salary.installments }, (_, i) => {
      const installmentDate = addDays(entryDate, i * daysBetween);
      return {
        number: i + 1,
        amount: installmentAmount,
        date: installmentDate,
      };
    });
  };

  const getTotalThirteenth = () => {
    return thirteenthSalaries.reduce((sum, s) => sum + s.amount, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">13º Salário</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(getTotalThirteenth())}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSalary(undefined);
            setFormData({ amount: '', entryDate: new Date().toISOString().split('T')[0], installments: '2', description: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Novo 13º
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editingSalary ? 'Editar' : 'Novo'} 13º Salário</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 dark:text-gray-400">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Valor Total</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Data de Entrada</label>
              <input
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Número de Parcelas</label>
              <select
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="1">1 parcela</option>
                <option value="2">2 parcelas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Descrição (opcional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Ex: 13º Salário 2024"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                {editingSalary ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {thirteenthSalaries.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum 13º salário cadastrado</p>
        ) : (
          thirteenthSalaries.map(salary => {
            const installments = calculateInstallments(salary);
            return (
              <div key={salary.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {salary.description || '13º Salário'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Valor total: <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(salary.amount)}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Data de entrada: {format(new Date(salary.entryDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(salary)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(salary.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="border-t dark:border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <Calculator size={18} />
                    Parcelas Calculadas:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {installments.map((inst, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {inst.number}ª parcela
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {format(inst.date, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(inst.amount)}
                        </span>
                      </div>
                    ))}
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


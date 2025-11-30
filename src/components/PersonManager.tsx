import { useState } from 'react';
import { Plus, Edit, Trash2, X, User, Calendar, DollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/calculations';
import type { Person } from '../types';

export const PersonManager = () => {
  const { people, addPerson, updatePerson, deletePerson } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    grossSalary: '',
    netSalary: '',
    thirteenthSalary: '',
    paymentDay: '5',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const personData = {
      name: formData.name,
      grossSalary: parseFloat(formData.grossSalary),
      netSalary: parseFloat(formData.netSalary),
      thirteenthSalary: parseFloat(formData.thirteenthSalary),
      paymentDay: parseInt(formData.paymentDay),
    };

    if (editingPerson) {
      updatePerson(editingPerson.id, personData);
    } else {
      addPerson(personData);
    }
    setShowForm(false);
    setEditingPerson(undefined);
    setFormData({ name: '', grossSalary: '', netSalary: '', thirteenthSalary: '', paymentDay: '5' });
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      grossSalary: person.grossSalary.toString(),
      netSalary: person.netSalary.toString(),
      thirteenthSalary: person.thirteenthSalary.toString(),
      paymentDay: person.paymentDay.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
      deletePerson(id);
    }
  };

  const getTotalIncome = () => {
    return people.reduce((sum, p) => sum + p.netSalary, 0);
  };

  const getTotalThirteenth = () => {
    return people.reduce((sum, p) => sum + p.thirteenthSalary, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pessoas</h2>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Renda Total: <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(getTotalIncome())}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              13º Total: <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(getTotalThirteenth())}</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingPerson(undefined);
            setFormData({ name: '', grossSalary: '', netSalary: '', thirteenthSalary: '', paymentDay: '5' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nova Pessoa
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editingPerson ? 'Editar' : 'Nova'} Pessoa</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 dark:text-gray-400">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Salário Bruto</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.grossSalary}
                  onChange={(e) => setFormData({ ...formData, grossSalary: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Salário Líquido</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.netSalary}
                  onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">13º Salário</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.thirteenthSalary}
                  onChange={(e) => setFormData({ ...formData, thirteenthSalary: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Dia do Pagamento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDay}
                  onChange={(e) => setFormData({ ...formData, paymentDay: e.target.value })}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                {editingPerson ? 'Atualizar' : 'Adicionar'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 col-span-2">Nenhuma pessoa cadastrada</p>
        ) : (
          people.map(person => (
            <div key={person.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <User size={24} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{person.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      Dia {person.paymentDay} de cada mês
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(person)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(person.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Bruto:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(person.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Líquido:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(person.netSalary)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">13º Salário:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(person.thirteenthSalary)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


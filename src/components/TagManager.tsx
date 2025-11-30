import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Tag } from '../types';

export const TagManager = () => {
  const { tags, addTag, updateTag, deleteTag } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    color: '#6b7280',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateTag(editingTag.id, formData);
    } else {
      addTag(formData);
    }
    setShowForm(false);
    setEditingTag(undefined);
    setFormData({ name: '', color: '#6b7280' });
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tag?')) {
      deleteTag(id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h2>
        <button
          onClick={() => {
            setEditingTag(undefined);
            setFormData({ name: '', color: '#6b7280' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Nova Tag
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{editingTag ? 'Editar' : 'Nova'} Tag</h3>
            <button onClick={() => setShowForm(false)}>
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
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Cor</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border dark:border-gray-600 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                {editingTag ? 'Atualizar' : 'Adicionar'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-all"
            style={{ borderLeft: `4px solid ${tag.color}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md"
                style={{ backgroundColor: tag.color }}
              >
                #
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{tag.name}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400" style={{ color: tag.color }}>
                  {tag.color.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(tag)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


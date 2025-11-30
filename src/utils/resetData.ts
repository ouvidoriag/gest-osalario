import { sqliteStorage } from './sqlite';
import { initialTransactions } from '../data/initialData';

/**
 * Limpa todos os dados do localStorage e recarrega com dados iniciais
 */
export const resetAllData = () => {
  if (confirm('Tem certeza que deseja limpar TODOS os dados e recarregar com os dados iniciais? Esta ação não pode ser desfeita!')) {
    localStorage.clear();
    // Recarrega a página para reinicializar
    window.location.reload();
  }
};

/**
 * Atualiza as datas das transações existentes para 2025
 */
export const updateDatesTo2025 = async () => {
  try {
    await sqliteStorage.init();
    const transactions = sqliteStorage.getTransactions();
    
    if (transactions.length === 0) {
      alert('Nenhuma transação encontrada para atualizar');
      return;
    }

    const updated = transactions.map(trans => {
      // Se a data é de 2024, atualiza para 2025
      if (trans.date.startsWith('2024-')) {
        return {
          ...trans,
          date: trans.date.replace('2024-', '2025-')
        };
      }
      // Mercearia deve ser setembro de 2025
      if (trans.description === 'Mercearia' && trans.date.startsWith('2025-')) {
        return {
          ...trans,
          date: '2025-09-01'
        };
      }
      return trans;
    });

    sqliteStorage.saveTransactions(updated);
    alert(`Atualizadas ${updated.length} transações para 2025! Recarregue a página para ver as mudanças.`);
    window.location.reload();
  } catch (error) {
    console.error('Erro ao atualizar datas:', error);
    alert('Erro ao atualizar datas. Tente novamente.');
  }
};


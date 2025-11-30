import { indexedDBStorage } from './indexedDB';
import { populateDatabase } from './populateDatabase';

/**
 * Restaura os dados corretamente:
 * 1. Limpa tudo
 * 2. Recria com populateDatabase (que agora cria no dia 5)
 */
export const restaurarDadosCorretos = async () => {
  try {
    console.log('🔧 RESTAURANDO DADOS CORRETOS...\n');
    
    // Primeiro, atualiza o populateDatabase para criar no dia 5
    // Mas isso já foi feito - agora vamos apenas limpar e recriar
    
    console.log('🧹 Limpando todos os dados...');
    await indexedDBStorage.saveTransactions([]);
    await indexedDBStorage.savePeople([]);
    console.log('✅ Dados limpos!\n');
    
    console.log('📦 Recriando dados com populateDatabase...');
    
    // Garante que está logado como admin
    const adminUser = { id: 'admin', username: 'admin', password: 'admin123', createdAt: new Date().toISOString() };
    localStorage.setItem('finance_current_user', JSON.stringify(adminUser));
    
    // Recria os dados
    await populateDatabase();
    
    console.log('\n✅ DADOS RESTAURADOS COM SUCESSO!');
    console.log('🔄 Recarregue a página para ver os dados corretos.');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao restaurar:', error);
    throw error;
  }
};

// Expõe globalmente
(window as any).restaurarDadosCorretos = restaurarDadosCorretos;


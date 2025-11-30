import { indexedDBStorage, initDatabase } from './indexedDB';
import { populateDatabase } from './populateDatabase';

/**
 * Script para:
 * 1. Remover dados do usuário "teste"
 * 2. Zerar dados do admin
 * 3. Popular dados do Wellington e Gabrielle para o admin
 */
export const migrarDadosWellingtonGabrielle = async () => {
  try {
    console.log('🚀 Iniciando migração de dados...');
    console.log('📋 Tarefas:');
    console.log('   1. Remover dados do usuário "teste"');
    console.log('   2. Zerar dados do admin');
    console.log('   3. Popular dados do Wellington e Gabrielle para admin');
    console.log('');

    const db = await initDatabase();

    // 1. Remove dados do usuário "teste"
    console.log('🧹 Passo 1: Removendo dados do usuário "teste"...');
    const allTransactions = await indexedDBStorage.getTransactions().catch(() => []);
    const allPeople = await indexedDBStorage.getPeople().catch(() => []);
    const allCategories = await indexedDBStorage.getCategories().catch(() => []);
    const allTags = await indexedDBStorage.getTags().catch(() => []);
    const allThirteenthSalaries = await indexedDBStorage.getThirteenthSalaries().catch(() => []);

    // Obtém todas as transações do banco (sem filtro de usuário)
    const allTransFromDB = await new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readonly');
      const store = tx.objectStore('transactions');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    const transactionsAdmin = allTransFromDB.filter((t: any) => !t.userId || t.userId === 'admin');
    const transactionsTeste = allTransFromDB.filter((t: any) => t.userId === 'teste');
    const peopleAdmin = allPeople.filter((p: any) => !p.userId || p.userId === 'admin');
    const peopleTeste = allPeople.filter((p: any) => p.userId === 'teste');

    console.log(`   ✅ Encontrados ${transactionsTeste.length} transações do teste`);
    console.log(`   ✅ Encontrados ${peopleTeste.length} pessoas do teste`);
    console.log(`   ℹ️  Mantendo ${transactionsAdmin.length} transações do admin`);
    console.log(`   ℹ️  Mantendo ${peopleAdmin.length} pessoas do admin`);

    // 2. Limpa dados do admin também (vamos recriar do zero)
    console.log('');
    console.log('🧹 Passo 2: Zerando dados do admin...');

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        console.log('   ✅ Todas as transações foram removidas');
        resolve();
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['people'], 'readwrite');
      const store = tx.objectStore('people');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        console.log('   ✅ Todas as pessoas foram removidas');
        resolve();
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Remove flag do setup teste
    localStorage.removeItem('teste_setup_completed');
    console.log('   ✅ Flag de setup teste removido');

    // 3. Popula dados do Wellington e Gabrielle para admin
    console.log('');
    console.log('📦 Passo 3: Populando dados do Wellington e Gabrielle para admin...');
    
    // Garante que está logado como admin
    const usersData = localStorage.getItem('finance_users');
    let users: any[] = usersData ? JSON.parse(usersData) : [];
    const adminUser = users.find((u: any) => u.username === 'admin');
    
    if (adminUser) {
      localStorage.setItem('finance_current_user', JSON.stringify(adminUser));
      console.log('   ✅ Login como admin garantido');
    }

    // Chama populateDatabase que já cria os dados (vai usar o admin como userId)
    await populateDatabase();
    
    console.log('');
    console.log('✅ Migração concluída com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log('   ✅ Dados do teste removidos');
    console.log('   ✅ Dados do admin zerados');
    console.log('   ✅ Dados do Wellington e Gabrielle populados para admin');
    console.log('');
    console.log('🔄 Recarregue a página para ver os dados!');

    return true;
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
};

// Expõe globalmente
(window as any).migrarDadosWellingtonGabrielle = migrarDadosWellingtonGabrielle;


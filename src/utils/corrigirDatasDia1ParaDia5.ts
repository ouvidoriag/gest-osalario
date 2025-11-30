import { indexedDBStorage } from './indexedDB';
import type { Transaction } from '../types';

/**
 * Corrige todas as transações que têm data dia 1, movendo para dia 5 do mesmo mês
 * Isso resolve o problema de timezone que faz despesas aparecerem no mês errado
 */
export const corrigirDatasDia1ParaDia5 = async () => {
  try {
    console.log('🔧 Iniciando correção de datas...');
    console.log('📋 Buscando todas as transações com data dia 1...\n');
    
    // Obtém todas as transações
    const allTransactions = await indexedDBStorage.getTransactions();
    
    // Filtra transações com data dia 1
    const transacoesParaCorrigir: Transaction[] = [];
    
    allTransactions.forEach(trans => {
      const [year, month, day] = trans.date.split('-').map(Number);
      if (day === 1) {
        transacoesParaCorrigir.push(trans);
      }
    });
    
    if (transacoesParaCorrigir.length === 0) {
      console.log('✅ Nenhuma transação encontrada com data dia 1.');
      return { corrigidas: 0, total: allTransactions.length };
    }
    
    console.log(`📊 Encontradas ${transacoesParaCorrigir.length} transação(ões) com data dia 1:\n`);
    
    // Lista as transações que serão corrigidas
    transacoesParaCorrigir.forEach(trans => {
      const [year, month] = trans.date.split('-');
      const novaData = `${year}-${month}-05`;
      console.log(`   - ${trans.description}: ${trans.date} → ${novaData}`);
    });
    
    console.log('\n🔄 Atualizando transações...\n');
    
    // Atualiza cada transação
    let corrigidas = 0;
    for (const trans of transacoesParaCorrigir) {
      const [year, month] = trans.date.split('-');
      const novaData = `${year}-${month}-05`;
      
      try {
        await indexedDBStorage.updateTransaction(trans.id, {
          date: novaData
        });
        corrigidas++;
        console.log(`   ✅ ${trans.description}: ${trans.date} → ${novaData}`);
      } catch (error) {
        console.error(`   ❌ Erro ao atualizar ${trans.description}:`, error);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Correção concluída!`);
    console.log(`   📊 Total de transações: ${allTransactions.length}`);
    console.log(`   🔧 Transações corrigidas: ${corrigidas}`);
    console.log(`   ⏭️  Transações não alteradas: ${allTransactions.length - corrigidas}`);
    console.log('='.repeat(50));
    
    return {
      corrigidas,
      total: allTransactions.length,
      transacoesCorrigidas: transacoesParaCorrigir.map(t => ({
        id: t.id,
        description: t.description,
        dataAntiga: t.date,
        dataNova: t.date.replace(/-01$/, '-05')
      }))
    };
  } catch (error) {
    console.error('❌ Erro ao corrigir datas:', error);
    throw error;
  }
};

// Expõe globalmente
(window as any).corrigirDatasDia1ParaDia5 = corrigirDatasDia1ParaDia5;


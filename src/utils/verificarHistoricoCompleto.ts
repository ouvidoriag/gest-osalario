import { indexedDBStorage } from './indexedDB';
import type { Transaction } from '../types';

/**
 * Verifica se o histórico está completo comparando com o que deveria ter
 */
export const verificarHistoricoCompleto = async () => {
  try {
    console.log('🔍 Verificando histórico completo...\n');
    
    const allTransactions = await indexedDBStorage.getTransactions();
    
    // Agrupa por mês
    const byMonth: Record<string, { income: Transaction[], expense: Transaction[] }> = {};
    allTransactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { income: [], expense: [] };
      byMonth[month][t.type].push(t);
    });
    
    console.log('📊 DADOS ATUAIS:\n');
    Object.keys(byMonth).sort().forEach(month => {
      const data = byMonth[month];
      const totalIncome = data.income.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = data.expense.reduce((sum, t) => sum + t.amount, 0);
      console.log(`📅 ${month}:`);
      console.log(`   💰 ${data.income.length} receitas = R$ ${totalIncome.toFixed(2)}`);
      console.log(`   💸 ${data.expense.length} despesas = R$ ${totalExpense.toFixed(2)}`);
      console.log(`   💵 Saldo = R$ ${(totalIncome - totalExpense).toFixed(2)}`);
      console.log('');
    });
    
    // O que DEVERIA ter segundo populateDatabase
    console.log('\n📋 O QUE DEVERIA TER (segundo populateDatabase):\n');
    
    const meses = ['2025-12', '2026-01', '2026-02', '2026-03'];
    
    meses.forEach(month => {
      const data = byMonth[month] || { income: [], expense: [] };
      
      console.log(`📅 ${month}:`);
      
      // Receitas esperadas
      if (month === '2025-12') {
        console.log(`   💰 RECEITAS ESPERADAS: 6`);
        console.log(`      - Gabrielle - Salário: R$ 1.400,00`);
        console.log(`      - Gabrielle - 13º Salário: R$ 1.283,33`);
        console.log(`      - Gabrielle - Pensão: R$ 400,00`);
        console.log(`      - Wellington - Salário: R$ 3.750,00`);
        console.log(`      - Wellington - Salário Retroativo: R$ 1.233,33`);
        console.log(`      - Wellington - 13º Salário: R$ 616,66`);
        console.log(`      Total esperado: R$ 8.683,32`);
        console.log(`      Total atual: R$ ${data.income.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`);
      } else {
        console.log(`   💰 RECEITAS ESPERADAS: 0 (mas sincronização cria 2 salários)`);
      }
      
      // Despesas esperadas
      console.log(`   💸 DESPESAS ESPERADAS:`);
      
      // Gastos fixos (7 itens)
      const gastosFixos = [
        { desc: 'Aluguel', valor: 1200.00 },
        { desc: 'Hildo', valor: 1200.00 },
        { desc: 'Internet', valor: 112.76 },
        { desc: 'Telefone', valor: 54.27 },
        { desc: 'Água', valor: 56.36 },
        { desc: 'Luz', valor: 12.26 },
        { desc: 'Mercearia', valor: 220.00 },
      ];
      
      console.log(`      Fixos (7): ${gastosFixos.map(g => g.desc).join(', ')}`);
      
      // Parcelas esperadas por mês
      if (month === '2025-12') {
        const parcelasDez = [
          { desc: 'Celular', valor: 202.00, parcela: '8/10' },
          { desc: 'Fran', valor: 100.00, parcela: '1/1' },
          { desc: 'Paula', valor: 500.00, parcela: '1/1' },
          { desc: 'Priscila', valor: 505.00, parcela: '3/3' },
          { desc: 'Itaú', valor: 78.14, parcela: '10/13' },
          { desc: 'Davi', valor: 1000.00, parcela: '5/5' },
          { desc: 'Óculos', valor: 375.00, parcela: '4/4' },
          { desc: 'Fabi', valor: 500.00, parcela: '2/3' },
        ];
        console.log(`      Parcelas (8): ${parcelasDez.map(p => `${p.desc} ${p.parcela}`).join(', ')}`);
        const totalFixos = gastosFixos.reduce((sum, g) => sum + g.valor, 0);
        const totalParcelas = parcelasDez.reduce((sum, p) => sum + p.valor, 0);
        console.log(`      Total esperado: R$ ${(totalFixos + totalParcelas).toFixed(2)} (7 fixos + 8 parcelas = 15 despesas)`);
      } else if (month === '2026-01') {
        const parcelasJan = [
          { desc: 'Celular', valor: 202.00, parcela: '9/10' },
          { desc: 'Fran', valor: 100.00, parcela: '1/1' },
          { desc: 'Paula', valor: 500.00, parcela: '1/1' },
          { desc: 'Itaú', valor: 78.14, parcela: '11/13' },
          { desc: 'Fabi', valor: 500.00, parcela: '3/3' },
        ];
        console.log(`      Parcelas (5): ${parcelasJan.map(p => `${p.desc} ${p.parcela}`).join(', ')}`);
        const totalFixos = gastosFixos.reduce((sum, g) => sum + g.valor, 0);
        const totalParcelas = parcelasJan.reduce((sum, p) => sum + p.valor, 0);
        console.log(`      Total esperado: R$ ${(totalFixos + totalParcelas).toFixed(2)} (7 fixos + 5 parcelas = 12 despesas)`);
      } else if (month === '2026-02') {
        const parcelasFev = [
          { desc: 'Celular', valor: 202.00, parcela: '10/10' },
          { desc: 'Fran', valor: 100.00, parcela: '1/1' },
          { desc: 'Paula', valor: 500.00, parcela: '1/1' },
          { desc: 'Itaú', valor: 78.14, parcela: '12/13' },
        ];
        console.log(`      Parcelas (4): ${parcelasFev.map(p => `${p.desc} ${p.parcela}`).join(', ')}`);
        const totalFixos = gastosFixos.reduce((sum, g) => sum + g.valor, 0);
        const totalParcelas = parcelasFev.reduce((sum, p) => sum + p.valor, 0);
        console.log(`      Total esperado: R$ ${(totalFixos + totalParcelas).toFixed(2)} (7 fixos + 4 parcelas = 11 despesas)`);
      } else if (month === '2026-03') {
        const parcelasMar = [
          { desc: 'Fran', valor: 100.00, parcela: '1/1' },
          { desc: 'Paula', valor: 500.00, parcela: '1/1' },
          { desc: 'Itaú', valor: 78.14, parcela: '13/13' },
        ];
        console.log(`      Parcelas (3): ${parcelasMar.map(p => `${p.desc} ${p.parcela}`).join(', ')}`);
        const totalFixos = gastosFixos.reduce((sum, g) => sum + g.valor, 0);
        const totalParcelas = parcelasMar.reduce((sum, p) => sum + p.valor, 0);
        console.log(`      Total esperado: R$ ${(totalFixos + totalParcelas).toFixed(2)} (7 fixos + 3 parcelas = 10 despesas)`);
      }
      
      console.log(`      Total atual: R$ ${data.expense.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`);
      console.log('');
    });
    
    // Verifica o que está faltando
    console.log('\n🔍 VERIFICAÇÃO DETALHADA:\n');
    
    meses.forEach(month => {
      const data = byMonth[month] || { income: [], expense: [] };
      
      // Lista todas as despesas esperadas
      const despesasEsperadas: string[] = [];
      
      // Fixas
      despesasEsperadas.push('Aluguel', 'Hildo', 'Internet', 'Telefone', 'Água', 'Luz', 'Mercearia');
      
      // Parcelas por mês
      if (month === '2025-12') {
        despesasEsperadas.push('Celular', 'Fran', 'Paula', 'Priscila', 'Itaú', 'Davi', 'Óculos', 'Fabi');
      } else if (month === '2026-01') {
        despesasEsperadas.push('Celular', 'Fran', 'Paula', 'Itaú', 'Fabi');
      } else if (month === '2026-02') {
        despesasEsperadas.push('Celular', 'Fran', 'Paula', 'Itaú');
      } else if (month === '2026-03') {
        despesasEsperadas.push('Fran', 'Paula', 'Itaú');
      }
      
      // Verifica quais estão faltando
      const descricoesAtuais = data.expense.map(e => e.description);
      const faltando = despesasEsperadas.filter(esperada => 
        !descricoesAtuais.some(atual => atual.includes(esperada))
      );
      
      if (faltando.length > 0) {
        console.log(`❌ ${month} - FALTANDO ${faltando.length} despesa(s): ${faltando.join(', ')}`);
      } else {
        console.log(`✅ ${month} - Todas as despesas presentes!`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    throw error;
  }
};

// Expõe globalmente
(window as any).verificarHistoricoCompleto = verificarHistoricoCompleto;


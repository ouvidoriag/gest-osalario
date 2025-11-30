import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupClienteTeste } from './utils/setupClienteTeste.ts'
import { populateDatabase } from './utils/populateDatabase.ts'
import { migrarDadosWellingtonGabrielle } from './utils/migrarDadosWellingtonGabrielle.ts'

// Expõe funções úteis globalmente para o console
(window as any).populateDatabase = populateDatabase;
(window as any).setupClienteTeste = setupClienteTeste;
(window as any).migrarDadosWellingtonGabrielle = migrarDadosWellingtonGabrielle;

// Importa e expõe função de verificação
import('./utils/verificarHistoricoCompleto.ts').then(module => {
  (window as any).verificarHistoricoCompleto = module.verificarHistoricoCompleto;
});

// Importa e expõe função de correção de datas
import('./utils/corrigirDatasDia1ParaDia5.ts').then(module => {
  (window as any).corrigirDatasDia1ParaDia5 = module.corrigirDatasDia1ParaDia5;
});

// Importa e expõe função de restaurar dados
import('./utils/restaurarDadosCorretos.ts').then(module => {
  (window as any).restaurarDadosCorretos = module.restaurarDadosCorretos;
});

// Executa setup do cliente teste automaticamente na primeira vez
setupClienteTeste().then(() => {
  console.log('🎉 Sistema pronto para uso!');
  console.log('💡 Funções disponíveis no console:');
  console.log('   - populateDatabase() - Restaura dados do Wellington e Gabrielle');
  console.log('   - setupClienteTeste() - Cria dados do usuário teste');
}).catch(err => {
  console.error('Erro no setup:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


import type { Transaction, Category, Tag } from '../types';

export const defaultCategories: Omit<Category, 'id'>[] = [
  // Receitas
  { name: 'Salário', color: '#10b981', icon: '💰', type: 'income' },
  { name: '13º Salário', color: '#22c55e', icon: '🎁', type: 'income' },
  { name: 'Freelance', color: '#3b82f6', icon: '💼', type: 'income' },
  { name: 'Pensão', color: '#14b8a6', icon: '👨‍👩‍👧', type: 'income' },
  { name: 'Investimentos', color: '#8b5cf6', icon: '📈', type: 'income' },
  { name: 'Vendas', color: '#f59e0b', icon: '🛒', type: 'income' },
  { name: 'Bonificação', color: '#ec4899', icon: '🎉', type: 'income' },
  { name: 'Reembolso', color: '#06b6d4', icon: '↩️', type: 'income' },
  { name: 'Outros', color: '#6b7280', icon: '💵', type: 'income' },
  
  // Despesas - Moradia
  { name: 'Moradia', color: '#ef4444', icon: '🏠', type: 'expense' },
  { name: 'Aluguel', color: '#dc2626', icon: '🏘️', type: 'expense' },
  { name: 'Condomínio', color: '#b91c1c', icon: '🏢', type: 'expense' },
  { name: 'IPTU', color: '#991b1b', icon: '📋', type: 'expense' },
  { name: 'Manutenção', color: '#7f1d1d', icon: '🔧', type: 'expense' },
  
  // Despesas - Alimentação
  { name: 'Alimentação', color: '#f59e0b', icon: '🍔', type: 'expense' },
  { name: 'Supermercado', color: '#d97706', icon: '🛒', type: 'expense' },
  { name: 'Restaurante', color: '#b45309', icon: '🍽️', type: 'expense' },
  { name: 'Delivery', color: '#92400e', icon: '🍕', type: 'expense' },
  { name: 'Padaria', color: '#78350f', icon: '🥖', type: 'expense' },
  
  // Despesas - Transporte
  { name: 'Transporte', color: '#06b6d4', icon: '🚗', type: 'expense' },
  { name: 'Combustível', color: '#0891b2', icon: '⛽', type: 'expense' },
  { name: 'Uber/Táxi', color: '#0e7490', icon: '🚕', type: 'expense' },
  { name: 'Manutenção Veículo', color: '#155e75', icon: '🔧', type: 'expense' },
  { name: 'Estacionamento', color: '#164e63', icon: '🅿️', type: 'expense' },
  { name: 'Transporte Público', color: '#134e4a', icon: '🚌', type: 'expense' },
  
  // Despesas - Contas e Serviços
  { name: 'Contas', color: '#f97316', icon: '💡', type: 'expense' },
  { name: 'Energia Elétrica', color: '#ea580c', icon: '⚡', type: 'expense' },
  { name: 'Água', color: '#c2410c', icon: '💧', type: 'expense' },
  { name: 'Gás', color: '#9a3412', icon: '🔥', type: 'expense' },
  { name: 'Internet', color: '#7c2d12', icon: '🌐', type: 'expense' },
  { name: 'Telefone', color: '#dc2626', icon: '📱', type: 'expense' },
  { name: 'TV/Streaming', color: '#b91c1c', icon: '📺', type: 'expense' },
  
  // Despesas - Saúde
  { name: 'Saúde', color: '#ec4899', icon: '🏥', type: 'expense' },
  { name: 'Plano de Saúde', color: '#db2777', icon: '🏥', type: 'expense' },
  { name: 'Farmácia', color: '#be185d', icon: '💊', type: 'expense' },
  { name: 'Consultas', color: '#9f1239', icon: '👨‍⚕️', type: 'expense' },
  { name: 'Academia', color: '#831843', icon: '💪', type: 'expense' },
  
  // Despesas - Educação
  { name: 'Educação', color: '#6366f1', icon: '📚', type: 'expense' },
  { name: 'Escola/Cursos', color: '#4f46e5', icon: '🎓', type: 'expense' },
  { name: 'Material Escolar', color: '#4338ca', icon: '📝', type: 'expense' },
  { name: 'Livros', color: '#3730a3', icon: '📖', type: 'expense' },
  
  // Despesas - Lazer e Entretenimento
  { name: 'Lazer', color: '#14b8a6', icon: '🎮', type: 'expense' },
  { name: 'Cinema', color: '#0d9488', icon: '🎬', type: 'expense' },
  { name: 'Viagem', color: '#0f766e', icon: '✈️', type: 'expense' },
  { name: 'Hobbies', color: '#115e59', icon: '🎨', type: 'expense' },
  { name: 'Eventos', color: '#134e4a', icon: '🎪', type: 'expense' },
  
  // Despesas - Financeiras
  { name: 'Empréstimos', color: '#dc2626', icon: '💳', type: 'expense' },
  { name: 'Cartão de Crédito', color: '#e11d48', icon: '💳', type: 'expense' },
  { name: 'Financiamento', color: '#be123c', icon: '🏦', type: 'expense' },
  { name: 'Juros', color: '#9f1239', icon: '📊', type: 'expense' },
  { name: 'Taxas Bancárias', color: '#831843', icon: '🏛️', type: 'expense' },
  
  // Despesas - Pessoais
  { name: 'Vestuário', color: '#a855f7', icon: '👕', type: 'expense' },
  { name: 'Beleza', color: '#9333ea', icon: '💅', type: 'expense' },
  { name: 'Presentes', color: '#7e22ce', icon: '🎁', type: 'expense' },
  { name: 'Pet', color: '#6b21a8', icon: '🐾', type: 'expense' },
  
  // Despesas - Outras
  { name: 'Seguros', color: '#3b82f6', icon: '🛡️', type: 'expense' },
  { name: 'Impostos', color: '#2563eb', icon: '📄', type: 'expense' },
  { name: 'Doações', color: '#1d4ed8', icon: '❤️', type: 'expense' },
  { name: 'Outros', color: '#6b7280', icon: '📦', type: 'expense' },
];

export const defaultTags: Omit<Tag, 'id'>[] = [
  // Prioridade
  { name: 'Urgente', color: '#ef4444' },
  { name: 'Alta Prioridade', color: '#f97316' },
  { name: 'Média Prioridade', color: '#fbbf24' },
  { name: 'Baixa Prioridade', color: '#84cc16' },
  { name: 'Crítico', color: '#dc2626' },
  { name: 'Importante', color: '#ea580c' },
  
  // Tipo de pagamento
  { name: 'Parcelado', color: '#f59e0b' },
  { name: 'Recorrente', color: '#3b82f6' },
  { name: 'Único', color: '#8b5cf6' },
  { name: 'Mensal', color: '#06b6d4' },
  { name: 'Anual', color: '#14b8a6' },
  { name: 'Semestral', color: '#10b981' },
  { name: 'Trimestral', color: '#22c55e' },
  { name: 'Avulso', color: '#6366f1' },
  
  // Contexto e Origem
  { name: 'Pessoal', color: '#a855f7' },
  { name: 'Trabalho', color: '#10b981' },
  { name: 'Família', color: '#ec4899' },
  { name: 'Casa', color: '#ef4444' },
  { name: 'Wellington', color: '#3b82f6' },
  { name: 'Gabrielle', color: '#ec4899' },
  { name: 'Compartilhado', color: '#8b5cf6' },
  
  // Natureza da despesa
  { name: 'Essencial', color: '#06b6d4' },
  { name: 'Opcional', color: '#6b7280' },
  { name: 'Luxo', color: '#a855f7' },
  { name: 'Necessário', color: '#10b981' },
  { name: 'Emergência', color: '#ef4444' },
  { name: 'Planejado', color: '#22c55e' },
  { name: 'Imprevisto', color: '#f59e0b' },
  
  // Status
  { name: 'Pago', color: '#22c55e' },
  { name: 'Pendente', color: '#f59e0b' },
  { name: 'Atrasado', color: '#ef4444' },
  { name: 'Agendado', color: '#3b82f6' },
  { name: 'Cancelado', color: '#6b7280' },
  
  // Categorias específicas
  { name: '13º Salário', color: '#22c55e' },
  { name: 'Salário Retroativo', color: '#3b82f6' },
  { name: 'Bonificação', color: '#ec4899' },
  { name: 'Reembolso', color: '#06b6d4' },
  { name: 'Investimento', color: '#8b5cf6' },
  { name: 'Venda', color: '#f59e0b' },
  
  // Tipos de despesa
  { name: 'Fixas', color: '#6366f1' },
  { name: 'Variáveis', color: '#14b8a6' },
  { name: 'Saúde', color: '#ec4899' },
  { name: 'Educação', color: '#6366f1' },
  { name: 'Transporte', color: '#06b6d4' },
  { name: 'Alimentação', color: '#f59e0b' },
  { name: 'Lazer', color: '#14b8a6' },
  { name: 'Moradia', color: '#ef4444' },
  
  // Organização
  { name: 'Débito Automático', color: '#3b82f6' },
  { name: 'Boleto', color: '#f97316' },
  { name: 'PIX', color: '#10b981' },
  { name: 'Cartão', color: '#e11d48' },
  { name: 'Dinheiro', color: '#22c55e' },
  { name: 'Transferência', color: '#06b6d4' },
  
  // Período
  { name: 'Diário', color: '#06b6d4' },
  { name: 'Semanal', color: '#3b82f6' },
  { name: 'Quinzenal', color: '#8b5cf6' },
  { name: 'Bimestral', color: '#a855f7' },
];

export const initialTransactions: Omit<Transaction, 'id'>[] = [
  {
    type: 'expense',
    description: 'Celular',
    amount: 202.00,
    date: '2025-12-01',
    category: 'Contas',
    tags: ['Parcelado', 'Recorrente'],
    status: 'open',
    installment: { current: 8, total: 10 },
  },
  {
    type: 'expense',
    description: 'Fran',
    amount: 100.00,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Pessoal'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Paula',
    amount: 500.00,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Pessoal'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Priscila',
    amount: 505.00,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Pessoal'],
    status: 'open',
    installment: { current: 3, total: 3 },
  },
  {
    type: 'expense',
    description: 'Itaú',
    amount: 78.14,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Parcelado'],
    status: 'open',
    installment: { current: 10, total: 13 },
  },
  {
    type: 'expense',
    description: 'Água',
    amount: 56.36,
    date: '2025-12-01',
    category: 'Contas',
    tags: ['Recorrente'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Luz',
    amount: 12.26,
    date: '2025-12-01',
    category: 'Contas',
    tags: ['Recorrente'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Aluguel',
    amount: 1200.00,
    date: '2025-12-01',
    category: 'Moradia',
    tags: ['Recorrente', 'Urgente'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Hildo',
    amount: 1200.00,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Pessoal'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Internet',
    amount: 112.76,
    date: '2025-12-01',
    category: 'Contas',
    tags: ['Recorrente'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Telefone',
    amount: 54.27,
    date: '2025-12-01',
    category: 'Contas',
    tags: ['Recorrente'],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Mercearia',
    amount: 220.00,
    date: '2025-09-01',
    category: 'Alimentação',
    tags: [],
    status: 'open',
  },
  {
    type: 'expense',
    description: 'Davi',
    amount: 1000.00,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Pessoal'],
    status: 'open',
    installment: { current: 5, total: 5 },
  },
  {
    type: 'expense',
    description: 'Óculos',
    amount: 375.00,
    date: '2025-12-01',
    category: 'Saúde',
    tags: ['Parcelado'],
    status: 'open',
    installment: { current: 4, total: 4 },
  },
  {
    type: 'expense',
    description: 'Fabi',
    amount: 500.00,
    date: '2025-12-01',
    category: 'Empréstimos',
    tags: ['Pessoal'],
    status: 'open',
    installment: { current: 2, total: 3 },
  },
];


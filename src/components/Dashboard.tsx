import { useState } from 'react';
import { Home, DollarSign, TrendingUp, Tag, Settings, Moon, Sun, Gift, Users, AlertCircle, Calendar, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SummaryCards } from './SummaryCards';
import { TransactionList } from './TransactionList';
import { CategoryChart } from './CategoryChart';
import { MonthlyProjection } from './MonthlyProjection';
import { CategoryManager } from './CategoryManager';
import { TagManager } from './TagManager';
import { ThirteenthSalaryManager } from './ThirteenthSalaryManager';
import { PersonManager } from './PersonManager';
import { PaymentPriority } from './PaymentPriority';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { filterTransactionsByPeriod, getPeriodLabel, type PeriodFilter } from '../utils/dateFilter';

type Tab = 'dashboard' | 'transactions' | 'categories' | 'tags' | 'projection' | 'thirteenth' | 'people' | 'priority';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const { isDark, toggleTheme } = useTheme();
  const { transactions } = useFinance();
  const { user, logout } = useAuth();

  // Filtra transações pelo período selecionado
  const filteredTransactions = filterTransactionsByPeriod(transactions, periodFilter, monthOffset);
  
  const periodLabel = getPeriodLabel(periodFilter, monthOffset);

  // Calcula data de início do período atual para saldo acumulado
  const currentPeriodStart = periodFilter === 'month' 
    ? new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1)
    : undefined;

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
    { id: 'transactions' as Tab, label: 'Transações', icon: DollarSign },
    { id: 'projection' as Tab, label: 'Projeção', icon: TrendingUp },
    { id: 'people' as Tab, label: 'Pessoas', icon: Users },
    { id: 'priority' as Tab, label: 'Prioridades', icon: AlertCircle },
    { id: 'thirteenth' as Tab, label: '13º Salário', icon: Gift },
    { id: 'categories' as Tab, label: 'Categorias', icon: Settings },
    { id: 'tags' as Tab, label: 'Tags', icon: Tag },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <SummaryCards 
              transactions={filteredTransactions} 
              allTransactions={transactions}
              currentPeriodStart={currentPeriodStart}
            />
            <PaymentPriority periodFilter={periodFilter} monthOffset={monthOffset} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart transactions={filteredTransactions} />
              <MonthlyProjection transactions={filteredTransactions} />
            </div>
          </div>
        );
      case 'transactions':
        return <TransactionList transactions={filteredTransactions} />;
      case 'projection':
        return <MonthlyProjection transactions={filteredTransactions} />;
      case 'categories':
        return <CategoryManager />;
      case 'tags':
        return <TagManager />;
      case 'thirteenth':
        return <ThirteenthSalaryManager />;
      case 'people':
        return <PersonManager />;
      case 'priority':
        return <PaymentPriority periodFilter={periodFilter} monthOffset={monthOffset} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bem-vindo, <span className="font-semibold">{user?.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Sair</span>
            </button>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border dark:border-gray-700 shadow-sm">
              <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
              <select
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value as PeriodFilter);
                  if (e.target.value !== 'month') setMonthOffset(0);
                }}
                className="bg-transparent border-none text-gray-700 dark:text-gray-300 font-medium cursor-pointer focus:outline-none text-sm"
              >
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="month">Mês</option>
              </select>
              {periodFilter === 'month' && (
                <div className="flex items-center gap-1 ml-2 pl-2 border-l dark:border-gray-600">
                  <button
                    onClick={() => setMonthOffset(prev => prev - 1)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Mês anterior"
                  >
                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
                    {periodLabel}
                  </span>
                  <button
                    onClick={() => setMonthOffset(prev => prev + 1)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Próximo mês"
                  >
                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 border dark:border-gray-700">
          <nav className="flex space-x-1 p-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white dark:bg-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};


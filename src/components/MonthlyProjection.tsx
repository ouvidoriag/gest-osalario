import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getMonthlyProjections, formatCurrency } from '../utils/calculations';
import type { Transaction } from '../types';

interface MonthlyProjectionProps {
  transactions: Transaction[];
}

const getBalanceColor = (balance: number) => {
  if (balance < 0) return '#ef4444';
  if (balance <= 1000) return '#f59e0b';
  return '#10b981';
};

export const MonthlyProjection = ({ transactions }: MonthlyProjectionProps) => {
  const projections = getMonthlyProjections(transactions);

  const chartData = projections.map(proj => ({
    mês: proj.month,
    Entradas: proj.income,
    Saídas: proj.expenses,
    Saldo: proj.balance,
    saldoColor: getBalanceColor(proj.balance),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Projeção Mensal</h2>
      {chartData.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum dado disponível</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="mês" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
              <Bar 
                dataKey="Entradas" 
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`entrada-${index}`} fill="#10b981" />
                ))}
              </Bar>
              <Bar 
                dataKey="Saídas" 
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`saida-${index}`} fill="#ef4444" />
                ))}
              </Bar>
              <Bar 
                dataKey="Saldo" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`saldo-${index}`} fill={entry.saldoColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {projections.map((proj, index) => {
              const balanceColor = getBalanceColor(proj.balance);
              return (
                <div 
                  key={index} 
                  className="border dark:border-gray-700 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">{proj.month}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Entradas:</span>
                      <span className="text-green-600 dark:text-green-400 font-bold text-base">{formatCurrency(proj.income)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Saídas:</span>
                      <span className="text-red-600 dark:text-red-400 font-bold text-base">{formatCurrency(proj.expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">Saldo:</span>
                      <span 
                        className="font-bold text-lg"
                        style={{ color: balanceColor }}
                      >
                        {formatCurrency(proj.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { getTransactionsByCategory, formatCurrency } from '../utils/calculations';
import type { Transaction } from '../types';

interface CategoryChartProps {
  transactions: Transaction[];
}

// Cores vibrantes para o gráfico
const VIBRANT_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#e11d48', '#22c55e', '#0ea5e9'
];

export const CategoryChart = ({ transactions }: CategoryChartProps) => {
  const { categories } = useFinance();
  
  const categoryData = getTransactionsByCategory(transactions.filter(t => t.type === 'expense'));
  
  const chartData = categoryData.map(({ category, amount }, index) => {
    const cat = categories.find(c => c.name === category);
    return {
      name: category,
      value: amount,
      color: cat?.color || VIBRANT_COLORS[index % VIBRANT_COLORS.length],
      percentage: 0, // Será calculado depois
    };
  });

  // Calcula porcentagens
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const chartDataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));

  const COLORS = chartDataWithPercentage.map(d => d.color);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Despesas por Categoria</h2>
      {chartDataWithPercentage.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma despesa encontrada</p>
      ) : (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartDataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}\n${percentage.toFixed(1)}%`}
                outerRadius={120}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                paddingAngle={2}
              >
                {chartDataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index]}
                    stroke={entry.color}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Lista detalhada de categorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {chartDataWithPercentage
              .sort((a, b) => b.value - a.value)
              .map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};


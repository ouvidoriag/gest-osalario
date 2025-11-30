export type TransactionType = 'income' | 'expense';
export type PaymentStatus = 'paid' | 'open' | 'overdue';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  category: string;
  tags: string[];
  priority?: Priority;
  status?: PaymentStatus;
  installment?: {
    current: number;
    total: number;
  };
  isRecurring?: boolean; // Marca se a transação é recorrente (repete todos os meses)
  recurringMonths?: number; // Quantidade de meses para repetir (padrão: 12)
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface MonthlyProjection {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ThirteenthSalary {
  id: string;
  amount: number;
  entryDate: string;
  installments: number;
  description?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Person {
  id: string;
  name: string;
  grossSalary: number;
  netSalary: number;
  thirteenthSalary: number;
  paymentDay: number; // Dia do mês (1-31)
}

export interface PaymentSchedule {
  personId: string;
  paymentDate: string; // Data que o salário cai
  priorityDeadline: number; // Dias após o pagamento para pagar contas prioritárias (ex: 5 dias)
}


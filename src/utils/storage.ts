import type { Transaction, Category, Tag, ThirteenthSalary, Person } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  CATEGORIES: 'finance_categories',
  TAGS: 'finance_tags',
  THIRTEENTH_SALARIES: 'finance_thirteenth_salaries',
  PEOPLE: 'finance_people',
} as const;

const safeParse = <T,>(data: string | null, defaultValue: T): T => {
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Erro ao fazer parse dos dados:', error);
    return defaultValue;
  }
};

const safeSave = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
    // Se o localStorage estiver cheio, tenta limpar e salvar novamente
    if (error instanceof DOMException && error.code === 22) {
      console.warn('LocalStorage cheio, tentando limpar dados antigos...');
      try {
        localStorage.clear();
        localStorage.setItem(key, JSON.stringify(data));
      } catch (retryError) {
        console.error('Erro ao salvar após limpar localStorage:', retryError);
        alert('Erro ao salvar dados. O navegador pode estar sem espaço.');
      }
    }
  }
};

export const storage = {
  getTransactions: (): Transaction[] => {
    return safeParse<Transaction[]>(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS), []);
  },
  
  saveTransactions: (transactions: Transaction[]): void => {
    safeSave(STORAGE_KEYS.TRANSACTIONS, transactions);
  },
  
  getCategories: (): Category[] => {
    return safeParse<Category[]>(localStorage.getItem(STORAGE_KEYS.CATEGORIES), []);
  },
  
  saveCategories: (categories: Category[]): void => {
    safeSave(STORAGE_KEYS.CATEGORIES, categories);
  },
  
  getTags: (): Tag[] => {
    return safeParse<Tag[]>(localStorage.getItem(STORAGE_KEYS.TAGS), []);
  },
  
  saveTags: (tags: Tag[]): void => {
    safeSave(STORAGE_KEYS.TAGS, tags);
  },
  
  getThirteenthSalaries: (): ThirteenthSalary[] => {
    return safeParse<ThirteenthSalary[]>(localStorage.getItem(STORAGE_KEYS.THIRTEENTH_SALARIES), []);
  },
  
  saveThirteenthSalaries: (salaries: ThirteenthSalary[]): void => {
    safeSave(STORAGE_KEYS.THIRTEENTH_SALARIES, salaries);
  },
  
  getPeople: (): Person[] => {
    return safeParse<Person[]>(localStorage.getItem(STORAGE_KEYS.PEOPLE), []);
  },
  
  savePeople: (people: Person[]): void => {
    safeSave(STORAGE_KEYS.PEOPLE, people);
  },
};


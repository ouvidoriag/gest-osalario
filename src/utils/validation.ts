import type { Transaction, Person, Category, Tag, ThirteenthSalary } from '../types';

export const validateTransaction = (transaction: Partial<Transaction>): string | null => {
  if (!transaction.description || transaction.description.trim() === '') {
    return 'Descrição é obrigatória';
  }
  if (!transaction.amount || transaction.amount <= 0) {
    return 'Valor deve ser maior que zero';
  }
  if (!transaction.date) {
    return 'Data é obrigatória';
  }
  if (!transaction.category) {
    return 'Categoria é obrigatória';
  }
  try {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
  } catch {
    return 'Data inválida';
  }
  return null;
};

export const validatePerson = (person: Partial<Person>): string | null => {
  if (!person.name || person.name.trim() === '') {
    return 'Nome é obrigatório';
  }
  if (!person.netSalary || person.netSalary <= 0) {
    return 'Salário líquido deve ser maior que zero';
  }
  if (!person.paymentDay || person.paymentDay < 1 || person.paymentDay > 31) {
    return 'Dia do pagamento deve estar entre 1 e 31';
  }
  if (person.grossSalary !== undefined && person.grossSalary < person.netSalary) {
    return 'Salário bruto não pode ser menor que o líquido';
  }
  return null;
};

export const validateCategory = (category: Partial<Category>): string | null => {
  if (!category.name || category.name.trim() === '') {
    return 'Nome da categoria é obrigatório';
  }
  if (!category.type) {
    return 'Tipo da categoria é obrigatório';
  }
  return null;
};

export const validateTag = (tag: Partial<Tag>): string | null => {
  if (!tag.name || tag.name.trim() === '') {
    return 'Nome da tag é obrigatório';
  }
  return null;
};

export const validateThirteenthSalary = (salary: Partial<ThirteenthSalary>): string | null => {
  if (!salary.amount || salary.amount <= 0) {
    return 'Valor deve ser maior que zero';
  }
  if (!salary.entryDate) {
    return 'Data de entrada é obrigatória';
  }
  if (!salary.installments || salary.installments < 1 || salary.installments > 2) {
    return 'Número de parcelas deve ser 1 ou 2';
  }
  try {
    const date = new Date(salary.entryDate);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
  } catch {
    return 'Data inválida';
  }
  return null;
};


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Transaction, Category, Tag, ThirteenthSalary, Person } from '../types';
import { indexedDBStorage } from '../utils/indexedDB';
import { validateTransaction, validatePerson, validateCategory, validateTag, validateThirteenthSalary } from '../utils/validation';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  tags: Tag[];
  thirteenthSalaries: ThirteenthSalary[];
  people: Person[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addThirteenthSalary: (salary: Omit<ThirteenthSalary, 'id'>) => void;
  updateThirteenthSalary: (id: string, salary: Partial<ThirteenthSalary>) => void;
  deleteThirteenthSalary: (id: string) => void;
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [thirteenthSalaries, setThirteenthSalaries] = useState<ThirteenthSalary[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega dados do IndexedDB
        const [transactionsData, categoriesData, tagsData, salariesData, peopleData] = await Promise.all([
          indexedDBStorage.getTransactions(),
          indexedDBStorage.getCategories(),
          indexedDBStorage.getTags(),
          indexedDBStorage.getThirteenthSalaries(),
          indexedDBStorage.getPeople(),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
        setThirteenthSalaries(salariesData);
        setPeople(peopleData);

        let updatedTransactions = [...transactionsData];
        let created = 0;

        // Sincroniza 13º salários existentes (cria transações que faltam)
        for (const salary of salariesData) {
          const entryDate = new Date(salary.entryDate);
          const installmentAmount = salary.amount / salary.installments;
          const daysBetween = 30;

          for (let i = 0; i < salary.installments; i++) {
            const installmentDate = new Date(entryDate);
            installmentDate.setDate(installmentDate.getDate() + (i * daysBetween));
            const dateStr = installmentDate.toISOString().split('T')[0];

            const description = salary.description
              ? `${salary.description} - ${i + 1}ª parcela`
              : `13º Salário - ${i + 1}ª parcela`;

            // Verifica se já existe uma transação para esta parcela
            const exists = updatedTransactions.some(t =>
              t.type === 'income' &&
              t.category === '13º Salário' &&
              t.description === description &&
              t.date === dateStr
            );

            if (!exists) {
              const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                type: 'income',
                description,
                amount: installmentAmount,
                date: dateStr,
                category: '13º Salário',
                tags: ['13º Salário'],
              };
              updatedTransactions.push(newTransaction);
              created++;
            }
          }
        }

        // Sincroniza salários das pessoas existentes (cria transações que faltam)
        const today = new Date();
        for (const person of peopleData) {
          for (let i = 0; i < 12; i++) {
            const salaryDate = new Date(today.getFullYear(), today.getMonth() + i, person.paymentDay);
            const dateStr = salaryDate.toISOString().split('T')[0];
            const description = `${person.name} - Salário`;

            // Verifica se já existe uma transação de salário para esta pessoa neste mês
            const exists = updatedTransactions.some(t =>
              t.type === 'income' &&
              t.category === 'Salário' &&
              t.description === description &&
              t.date === dateStr
            );

            if (!exists) {
              const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                type: 'income',
                description,
                amount: person.netSalary,
                date: dateStr,
                category: 'Salário',
                tags: ['Recorrente', 'Trabalho', person.name],
              };
              updatedTransactions.push(newTransaction);
              created++;
            }
          }
        }

        // Sincroniza parcelas (cria parcelas futuras que faltam)
        const installmentTransactions = updatedTransactions.filter(t => 
          t.installment && t.installment.current && t.installment.total
        );

        // Agrupa por descrição e valor para identificar a mesma despesa parcelada
        const installmentGroups = installmentTransactions.reduce((acc, t) => {
          const key = `${t.description}_${t.amount}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(t);
          return acc;
        }, {} as Record<string, typeof installmentTransactions>);

        // Para cada grupo de parcelas, verifica se falta alguma
        for (const [, group] of Object.entries(installmentGroups)) {
          if (group.length === 0) continue;
          
          // Pega a primeira transação como referência
          const reference = group[0];
          const { total } = reference.installment!;
          
          // Encontra a parcela mais recente (maior número)
          const maxCurrent = Math.max(...group.map(t => t.installment!.current));
          
          // Se ainda faltam parcelas, cria elas
          if (maxCurrent < total) {
            const lastTransaction = group.find(t => t.installment!.current === maxCurrent);
            if (!lastTransaction) continue;
            
            const baseDate = new Date(lastTransaction.date);
            const remainingInstallments = total - maxCurrent;
            
            for (let i = 1; i <= remainingInstallments; i++) {
              const installmentDate = new Date(baseDate);
              installmentDate.setMonth(installmentDate.getMonth() + i);
              const dateStr = installmentDate.toISOString().split('T')[0];
              
              // Verifica se já existe
              const exists = updatedTransactions.some(t =>
                t.description === reference.description &&
                t.amount === reference.amount &&
                t.installment?.current === maxCurrent + i &&
                t.date === dateStr
              );
              
              if (!exists) {
                const newTransaction: Transaction = {
                  id: crypto.randomUUID(),
                  type: reference.type,
                  description: reference.description,
                  amount: reference.amount,
                  date: dateStr,
                  category: reference.category,
                  tags: reference.tags.includes('Parcelado') ? reference.tags : [...reference.tags, 'Parcelado'],
                  installment: {
                    current: maxCurrent + i,
                    total: total,
                  },
                  priority: reference.priority,
                  status: 'open',
                };
                updatedTransactions.push(newTransaction);
                created++;
              }
            }
          }
        }

        // Salva as transações atualizadas se houver novas
        if (created > 0) {
          await indexedDBStorage.saveTransactions(updatedTransactions);
          console.log(`✅ Sincronizadas ${created} transações automaticamente (13º + salários + parcelas)!`);
        }

        setTransactions(updatedTransactions);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadData();
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const error = validateTransaction(transaction);
    if (error) {
      console.error('Erro de validação:', error);
      alert(error);
      return;
    }
    
    const newTransactions: Transaction[] = [];
    
    // Se for recorrente, cria múltiplas transações
    if (transaction.isRecurring) {
      const monthsToCreate = transaction.recurringMonths || 12;
      const baseDate = new Date(transaction.date);
      
      for (let i = 0; i < monthsToCreate; i++) {
        const recurringDate = new Date(baseDate);
        recurringDate.setMonth(recurringDate.getMonth() + i);
        
        const recurringTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          date: recurringDate.toISOString().split('T')[0],
          // Adiciona tag "Recorrente" se não existir
          tags: transaction.tags.includes('Recorrente') ? transaction.tags : [...transaction.tags, 'Recorrente'],
        };
        newTransactions.push(recurringTransaction);
      }
      
      console.log(`✅ Criadas ${monthsToCreate} transações recorrentes de "${transaction.description}"!`);
    } 
    // Se tem parcela, cria todas as parcelas automaticamente
    else if (transaction.installment && transaction.installment.current && transaction.installment.total) {
      const { current, total } = transaction.installment;
      const remainingInstallments = total - current + 1; // Inclui a parcela atual
      const baseDate = new Date(transaction.date);
      
      for (let i = 0; i < remainingInstallments; i++) {
        const installmentDate = new Date(baseDate);
        installmentDate.setMonth(installmentDate.getMonth() + i);
        
        const installmentTransaction: Transaction = {
          ...transaction,
          id: crypto.randomUUID(),
          date: installmentDate.toISOString().split('T')[0],
          installment: {
            current: current + i,
            total: total,
          },
          // Adiciona tag "Parcelado" se não existir
          tags: transaction.tags.includes('Parcelado') ? transaction.tags : [...transaction.tags, 'Parcelado'],
        };
        newTransactions.push(installmentTransaction);
      }
      
      console.log(`✅ Criadas ${remainingInstallments} parcelas de "${transaction.description}" (${current}/${total} até ${total}/${total})!`);
    } 
    else {
      // Transação única
      const newTransaction: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
      };
      newTransactions.push(newTransaction);
    }
    
    const updated = [...transactions, ...newTransactions];
    setTransactions(updated);
    indexedDBStorage.saveTransactions(updated).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const existing = transactions.find(t => t.id === id);
    if (!existing) {
      console.error('Transação não encontrada:', id);
      alert('Transação não encontrada');
      return;
    }
    
    // Para atualizações parciais (como mudança de status), não valida tudo
    const updatedTransaction = { ...existing, ...updates };
    
    // Só valida se todos os campos obrigatórios estão presentes
    if (updatedTransaction.description && updatedTransaction.amount && updatedTransaction.date && updatedTransaction.category) {
      const error = validateTransaction(updatedTransaction);
      if (error) {
        console.error('Erro de validação:', error);
        alert(error);
        return;
      }
    }
    
    const updated = transactions.map(t =>
      t.id === id ? updatedTransaction : t
    );
    setTransactions(updated);
    indexedDBStorage.saveTransactions(updated).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    indexedDBStorage.saveTransactions(updated).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const error = validateCategory(category);
    if (error) {
      console.error('Erro de validação:', error);
      alert(error);
      return;
    }
    
    // Verifica se já existe uma categoria com o mesmo nome (no estado e no IndexedDB)
    const existingInState = categories.find(c => c.name === category.name);
    if (existingInState) {
      return; // Silenciosamente ignora duplicatas
    }
    
    // Verifica também no IndexedDB para evitar condições de corrida
    try {
      const allCategories = await indexedDBStorage.getCategories();
      const existingInDB = allCategories.find(c => c.name === category.name);
      if (existingInDB) {
        // Atualiza o estado com os dados do banco
        setCategories(allCategories);
        return;
      }
    } catch (dbError) {
      console.warn('⚠️ Erro ao verificar categorias no banco:', dbError);
    }
    
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    try {
      await indexedDBStorage.addCategory(newCategory);
    } catch (error: any) {
      // Se o erro for de constraint (duplicata), apenas ignora
      if (error?.name === 'ConstraintError') {
        // Recarrega as categorias do banco para sincronizar
        const allCategories = await indexedDBStorage.getCategories();
        setCategories(allCategories);
        return;
      }
      console.error('❌ Erro ao salvar categoria:', error);
      // Se falhar, tenta salvar todas de uma vez
      indexedDBStorage.saveCategories(updated).catch(err => {
        console.error('❌ Erro ao salvar categorias:', err);
      });
    }
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    setCategories(updated);
    indexedDBStorage.saveCategories(updated).catch(error => {
      console.error('Erro ao salvar categorias:', error);
    });
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    indexedDBStorage.saveCategories(updated).catch(error => {
      console.error('Erro ao salvar categorias:', error);
    });
  };

  const addTag = async (tag: Omit<Tag, 'id'>) => {
    const error = validateTag(tag);
    if (error) {
      console.error('Erro de validação:', error);
      alert(error);
      return;
    }
    
    // Verifica se já existe uma tag com o mesmo nome (no estado e no IndexedDB)
    const existingInState = tags.find(t => t.name === tag.name);
    if (existingInState) {
      return; // Silenciosamente ignora duplicatas
    }
    
    // Verifica também no IndexedDB para evitar condições de corrida
    try {
      const allTags = await indexedDBStorage.getTags();
      const existingInDB = allTags.find(t => t.name === tag.name);
      if (existingInDB) {
        // Atualiza o estado com os dados do banco
        setTags(allTags);
        return;
      }
    } catch (dbError) {
      console.warn('⚠️ Erro ao verificar tags no banco:', dbError);
    }
    
    const newTag: Tag = {
      ...tag,
      id: crypto.randomUUID(),
    };
    const updated = [...tags, newTag];
    setTags(updated);
    try {
      await indexedDBStorage.addTag(newTag);
    } catch (error: any) {
      // Se o erro for de constraint (duplicata), apenas ignora
      if (error?.name === 'ConstraintError') {
        // Recarrega as tags do banco para sincronizar
        const allTags = await indexedDBStorage.getTags();
        setTags(allTags);
        return;
      }
      console.error('❌ Erro ao salvar tag:', error);
      // Se falhar, tenta salvar todas de uma vez
      indexedDBStorage.saveTags(updated).catch(err => {
        console.error('❌ Erro ao salvar tags:', err);
      });
    }
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    const updated = tags.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTags(updated);
    indexedDBStorage.saveTags(updated).catch(error => {
      console.error('Erro ao salvar tags:', error);
    });
  };

  const deleteTag = (id: string) => {
    const updated = tags.filter(t => t.id !== id);
    setTags(updated);
    indexedDBStorage.saveTags(updated).catch(error => {
      console.error('Erro ao salvar tags:', error);
    });
  };

  const addThirteenthSalary = (salary: Omit<ThirteenthSalary, 'id'>) => {
    const error = validateThirteenthSalary(salary);
    if (error) {
      console.error('Erro de validação:', error);
      alert(error);
      return;
    }
    
    const newSalary: ThirteenthSalary = {
      ...salary,
      id: crypto.randomUUID(),
    };
    const updated = [...thirteenthSalaries, newSalary];
    setThirteenthSalaries(updated);
    indexedDBStorage.saveThirteenthSalaries(updated).catch(error => {
      console.error('Erro ao salvar 13º salários:', error);
    });

    // Cria transações de entrada automaticamente baseadas nas parcelas
    const entryDate = new Date(salary.entryDate);
    const installmentAmount = salary.amount / salary.installments;
    const daysBetween = 30; // Aproximadamente 30 dias entre parcelas

    const newTransactions: Transaction[] = [];
    for (let i = 0; i < salary.installments; i++) {
      const installmentDate = new Date(entryDate);
      installmentDate.setDate(installmentDate.getDate() + (i * daysBetween));
      
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'income',
        description: salary.description
          ? `${salary.description} - ${i + 1}ª parcela`
          : `13º Salário - ${i + 1}ª parcela`,
        amount: installmentAmount,
        date: installmentDate.toISOString().split('T')[0],
        category: '13º Salário',
        tags: ['13º Salário'],
      };
      
      newTransactions.push(transaction);
    }

    // Adiciona todas as transações de uma vez
    const allTransactions = [...transactions, ...newTransactions];
    setTransactions(allTransactions);
    indexedDBStorage.saveTransactions(allTransactions).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });

    console.log(`✅ 13º salário cadastrado e ${salary.installments} transações criadas automaticamente!`);
  };

  const updateThirteenthSalary = (id: string, updates: Partial<ThirteenthSalary>) => {
    const existing = thirteenthSalaries.find(s => s.id === id);
    if (!existing) {
      console.error('13º salário não encontrado');
      return;
    }

    const updatedSalary = { ...existing, ...updates };
    const updated = thirteenthSalaries.map(s =>
      s.id === id ? updatedSalary : s
    );
    setThirteenthSalaries(updated);
    indexedDBStorage.saveThirteenthSalaries(updated).catch(error => {
      console.error('Erro ao salvar 13º salários:', error);
    });

    // Remove transações antigas relacionadas a este 13º salário
    const oldDescription = existing.description || '13º Salário';
    const updatedTransactions = transactions.filter(t => 
      !(t.type === 'income' && 
        t.category === '13º Salário' &&
        (t.description.includes(oldDescription) || t.description.includes('13º Salário - ')))
    );

    // Cria novas transações baseadas nos dados atualizados
    const entryDate = new Date(updatedSalary.entryDate);
    const installmentAmount = updatedSalary.amount / updatedSalary.installments;
    const daysBetween = 30;

    for (let i = 0; i < updatedSalary.installments; i++) {
      const installmentDate = new Date(entryDate);
      installmentDate.setDate(installmentDate.getDate() + (i * daysBetween));
      
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'income',
        description: updatedSalary.description
          ? `${updatedSalary.description} - ${i + 1}ª parcela`
          : `13º Salário - ${i + 1}ª parcela`,
        amount: installmentAmount,
        date: installmentDate.toISOString().split('T')[0],
        category: '13º Salário',
        tags: ['13º Salário'],
      };
      
      updatedTransactions.push(transaction);
    }

    setTransactions(updatedTransactions);
    indexedDBStorage.saveTransactions(updatedTransactions).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });

    console.log(`✅ 13º salário atualizado e transações recriadas!`);
  };

  const deleteThirteenthSalary = (id: string) => {
    const salaryToDelete = thirteenthSalaries.find(s => s.id === id);
    if (!salaryToDelete) {
      console.error('13º salário não encontrado');
      return;
    }

    // Remove transações relacionadas a este 13º salário
    const description = salaryToDelete.description || '13º Salário';
    const updatedTransactions = transactions.filter(t => 
      !(t.type === 'income' && 
        t.category === '13º Salário' &&
        (t.description.includes(description) || t.description.includes('13º Salário - ')))
    );
    
    setTransactions(updatedTransactions);
    indexedDBStorage.saveTransactions(updatedTransactions).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });

    const updated = thirteenthSalaries.filter(s => s.id !== id);
    setThirteenthSalaries(updated);
    indexedDBStorage.saveThirteenthSalaries(updated).catch(error => {
      console.error('Erro ao salvar 13º salários:', error);
    });

    console.log(`✅ 13º salário e suas transações removidos!`);
  };

  const addPerson = (person: Omit<Person, 'id'>) => {
    const error = validatePerson(person);
    if (error) {
      console.error('Erro de validação:', error);
      alert(error);
      return;
    }
    
    const newPerson: Person = {
      ...person,
      id: crypto.randomUUID(),
    };
    const updated = [...people, newPerson];
    setPeople(updated);
    indexedDBStorage.savePeople(updated).catch(error => {
      console.error('Erro ao salvar pessoas:', error);
    });

    // Cria transações de salário mensal automaticamente para os próximos 12 meses
    const today = new Date();
    const newTransactions: Transaction[] = [];
    
    for (let i = 0; i < 12; i++) {
      const salaryDate = new Date(today.getFullYear(), today.getMonth() + i, person.paymentDay);
      const dateStr = salaryDate.toISOString().split('T')[0];
      
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'income',
        description: `${person.name} - Salário`,
        amount: person.netSalary,
        date: dateStr,
        category: 'Salário',
        tags: ['Recorrente', 'Trabalho', person.name],
      };
      newTransactions.push(transaction);
    }

    const allTransactions = [...transactions, ...newTransactions];
    setTransactions(allTransactions);
    indexedDBStorage.saveTransactions(allTransactions).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });

    console.log(`✅ Pessoa cadastrada e 12 transações de salário criadas automaticamente!`);
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    const existing = people.find(p => p.id === id);
    if (!existing) {
      console.error('Pessoa não encontrada');
      return;
    }
    
    const updatedPerson = { ...existing, ...updates };
    const error = validatePerson(updatedPerson);
    if (error) {
      console.error('Erro de validação:', error);
      alert(error);
      return;
    }
    
    const updated = people.map(p =>
      p.id === id ? updatedPerson : p
    );
    setPeople(updated);
    indexedDBStorage.savePeople(updated).catch(error => {
      console.error('Erro ao salvar pessoas:', error);
    });

    // Remove transações antigas de salário desta pessoa
    const updatedTransactions = transactions.filter(t => 
      !(t.type === 'income' && 
        t.category === 'Salário' &&
        t.description === `${existing.name} - Salário`)
    );

    // Cria novas transações com os dados atualizados
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const salaryDate = new Date(today.getFullYear(), today.getMonth() + i, updatedPerson.paymentDay);
      const dateStr = salaryDate.toISOString().split('T')[0];
      
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'income',
        description: `${updatedPerson.name} - Salário`,
        amount: updatedPerson.netSalary,
        date: dateStr,
        category: 'Salário',
        tags: ['Recorrente', 'Trabalho', updatedPerson.name],
      };
      updatedTransactions.push(transaction);
    }

    setTransactions(updatedTransactions);
    indexedDBStorage.saveTransactions(updatedTransactions).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });

    console.log(`✅ Pessoa atualizada e transações de salário recriadas!`);
  };

  const deletePerson = (id: string) => {
    const personToDelete = people.find(p => p.id === id);
    if (!personToDelete) {
      console.error('Pessoa não encontrada');
      return;
    }

    // Remove transações de salário relacionadas a esta pessoa
    const updatedTransactions = transactions.filter(t => 
      !(t.type === 'income' && 
        t.category === 'Salário' &&
        t.description === `${personToDelete.name} - Salário`)
    );
    
    setTransactions(updatedTransactions);
    indexedDBStorage.saveTransactions(updatedTransactions).catch(error => {
      console.error('Erro ao salvar transações:', error);
    });

    const updated = people.filter(p => p.id !== id);
    setPeople(updated);
    indexedDBStorage.savePeople(updated).catch(error => {
      console.error('Erro ao salvar pessoas:', error);
    });

    console.log(`✅ Pessoa e suas transações de salário removidas!`);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        tags,
        thirteenthSalaries,
        people,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addTag,
        updateTag,
        deleteTag,
        addThirteenthSalary,
        updateThirteenthSalary,
        deleteThirteenthSalary,
        addPerson,
        updatePerson,
        deletePerson,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};


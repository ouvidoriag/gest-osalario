import { sqliteStorage } from './sqlite';
import { storage } from './storage';

/**
 * Migra dados do localStorage para SQLite
 */
export const migrateToSQLite = async () => {
  try {
    await sqliteStorage.init();
    
    // Verifica se já há dados no SQLite
    const existingTransactions = sqliteStorage.getTransactions();
    if (existingTransactions.length > 0) {
      console.log('Dados já existem no SQLite, pulando migração');
      return;
    }

    // Migra dados do localStorage
    const oldTransactions = storage.getTransactions();
    const oldCategories = storage.getCategories();
    const oldTags = storage.getTags();
    const oldSalaries = storage.getThirteenthSalaries();
    const oldPeople = storage.getPeople();

    if (oldTransactions.length > 0) {
      sqliteStorage.saveTransactions(oldTransactions);
      console.log(`Migradas ${oldTransactions.length} transações`);
    }

    if (oldCategories.length > 0) {
      sqliteStorage.saveCategories(oldCategories);
      console.log(`Migradas ${oldCategories.length} categorias`);
    }

    if (oldTags.length > 0) {
      sqliteStorage.saveTags(oldTags);
      console.log(`Migradas ${oldTags.length} tags`);
    }

    if (oldSalaries.length > 0) {
      sqliteStorage.saveThirteenthSalaries(oldSalaries);
      console.log(`Migrados ${oldSalaries.length} 13º salários`);
    }

    if (oldPeople.length > 0) {
      sqliteStorage.savePeople(oldPeople);
      console.log(`Migradas ${oldPeople.length} pessoas`);
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao migrar dados:', error);
  }
};


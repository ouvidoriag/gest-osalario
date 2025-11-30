import { useEffect, useRef } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { defaultCategories, defaultTags } from './data/initialData';
import { indexedDBStorage } from './utils/indexedDB';

const AppContent = () => {
  const { addCategory, addTag } = useFinance();
  const initialized = useRef(false);

  useEffect(() => {
    // Executa apenas uma vez ao montar o componente
    if (initialized.current) return;
    initialized.current = true;

    const initializeData = async () => {
      try {
        // Adiciona categorias padrão que não existem
        const existingCategories = await indexedDBStorage.getCategories();
        const categoriesToAdd = defaultCategories.filter(
          defaultCat => !existingCategories.some(existing => existing.name === defaultCat.name)
        );
        for (const cat of categoriesToAdd) {
          await addCategory(cat);
        }
        if (categoriesToAdd.length > 0) {
          console.log(`✅ ${categoriesToAdd.length} categorias padrão adicionadas!`);
        }

        // Adiciona tags padrão que não existem
        const existingTags = await indexedDBStorage.getTags();
        const tagsToAdd = defaultTags.filter(
          defaultTag => !existingTags.some(existing => existing.name === defaultTag.name)
        );
        for (const tag of tagsToAdd) {
          await addTag(tag);
        }
        if (tagsToAdd.length > 0) {
          console.log(`✅ ${tagsToAdd.length} tags padrão adicionadas!`);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar categorias e tags:', error);
      }
    };
    
    initializeData();
  }, [addCategory, addTag]);

  return <Dashboard />;
};

const AuthenticatedApp = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


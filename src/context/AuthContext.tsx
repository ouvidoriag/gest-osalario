import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'finance_users';
const CURRENT_USER_KEY = 'finance_current_user';

// Usuários padrão do sistema
const ADMIN_USER: User = {
  id: 'admin',
  username: 'admin',
  password: 'admin123', // Em produção, usar hash
  createdAt: new Date().toISOString(),
};

const TESTE_USER: User = {
  id: 'teste',
  username: 'teste',
  password: 'teste123', // Em produção, usar hash
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Inicializa usuários padrão se não existirem
    const usersData = localStorage.getItem(USERS_KEY);
    let users: User[] = usersData ? JSON.parse(usersData) : [];
    
    if (!users.find(u => u.username === 'admin')) {
      users.push(ADMIN_USER);
      console.log('✅ Usuário admin criado: admin / admin123');
    }

    if (!users.find(u => u.username === 'teste')) {
      users.push(TESTE_USER);
      console.log('✅ Usuário teste criado: teste / teste123');
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Verifica se há usuário logado
    const currentUserData = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      setUser(currentUser);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const usersData = localStorage.getItem(USERS_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      const foundUser = users.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
        console.log(`✅ Login realizado: ${username}`);
        console.log(`👤 Bem-vindo(a), ${username}!`);
        console.log('📊 Carregando seus dados isolados...');
        return true;
      }

      console.log('❌ Credenciais inválidas');
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const usersData = localStorage.getItem(USERS_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];

      // Verifica se usuário já existe
      if (users.find(u => u.username === username)) {
        console.log('❌ Usuário já existe');
        return false;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        password, // Em produção, usar hash
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      setUser(newUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      console.log(`✅ Usuário cadastrado: ${username}`);
      console.log(`🎉 Bem-vindo(a), ${username}! Sua conta foi criada com sucesso.`);
      console.log('📊 Você começa com dados em branco, independentes de outros usuários.');
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    console.log('✅ Logout realizado');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


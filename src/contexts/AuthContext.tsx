import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'cliente' | 'funcionario';
  endereco?: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  atualizarUsuario: (dados: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarSessao();
  }, []);

  async function carregarSessao() {
    try {
      const results = await AsyncStorage.multiGet(['@auth_token', '@user_data']);
      const tk = results[0][1];
      const us = results[1][1];
      if (tk && us) {
        setToken(tk);
        setUsuario(JSON.parse(us));
      }
    } catch {
      // sessão não encontrada
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha });
    const { token: newToken, usuario: novoUsuario } = response.data;

    await AsyncStorage.multiSet([
      ['@auth_token', newToken],
      ['@user_data', JSON.stringify(novoUsuario)],
    ]);

    setToken(newToken);
    setUsuario(novoUsuario);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['@auth_token', '@user_data', '@saved_email', '@saved_password']);
    setToken(null);
    setUsuario(null);
  }

  function atualizarUsuario(dados: Partial<Usuario>) {
    if (!usuario) return;
    const atualizado = { ...usuario, ...dados };
    setUsuario(atualizado);
    AsyncStorage.setItem('@user_data', JSON.stringify(atualizado));
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

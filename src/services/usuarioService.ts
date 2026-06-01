import api from '../lib/api';

export interface UsuarioPerfil {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cep?: string;
  rua?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  tipo: 'cliente' | 'funcionario';
}

export const usuarioService = {
  async buscar(id: string): Promise<UsuarioPerfil> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async atualizar(id: string, dados: Partial<Omit<UsuarioPerfil, 'id' | 'email' | 'tipo'>>): Promise<UsuarioPerfil> {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  },
};

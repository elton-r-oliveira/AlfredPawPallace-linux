import api from '../lib/api';

export const authService = {
  async register(
    nome: string,
    email: string,
    senha: string,
    tipo: 'cliente' | 'funcionario',
    codigoFuncionario?: string
  ) {
    const response = await api.post('/auth/register', { nome, email, senha, tipo, codigoFuncionario });
    return response.data;
  },
};

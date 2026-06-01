import api from '../lib/api';

export interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'banho' | 'tosa' | 'vacinacao' | 'consulta' | 'daycare' | 'produtos' | 'outros';
  corFundo: string;
  ordem: number;
  ativo: boolean;
}

export const promocaoService = {
  async listar(): Promise<Promocao[]> {
    const response = await api.get('/promocoes');
    return response.data;
  },
};

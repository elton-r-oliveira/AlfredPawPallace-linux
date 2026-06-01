import api from '../lib/api';

export interface Servico {
  id: string;
  name: string;
  price: number;
  duration: string;
  category?: string;
}

export const servicoService = {
  async listar(): Promise<Servico[]> {
    const response = await api.get('/servicos');
    return response.data;
  },
};

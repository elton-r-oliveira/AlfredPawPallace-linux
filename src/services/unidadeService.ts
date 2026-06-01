import api from '../lib/api';

export interface Unidade {
  id: string;
  nome: string;
  endereco: string;
  lat?: number;
  lng?: number;
  telefone?: string;
  whatsapp?: string;
  ativo: boolean;
  ordem: number;
}

export const unidadeService = {
  async listar(): Promise<Unidade[]> {
    const response = await api.get('/unidades');
    return response.data;
  },
};

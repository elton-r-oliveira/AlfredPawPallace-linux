import api from '../lib/api';
import { HealthRecord } from '../@types/HealthRecord';

export const saudeService = {
  async listar(petId: string): Promise<HealthRecord[]> {
    const response = await api.get('/saude', { params: { petId } });
    return response.data;
  },

  async criar(dados: Omit<HealthRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<HealthRecord> {
    const response = await api.post('/saude', dados);
    return response.data;
  },

  async atualizar(
    id: string,
    dados: Pick<HealthRecord, 'name' | 'date' | 'nextDate' | 'notes'>
  ): Promise<HealthRecord> {
    const response = await api.put(`/saude/${id}`, dados);
    return response.data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/saude/${id}`);
  },
};

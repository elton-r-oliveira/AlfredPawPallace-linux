import api from '../lib/api';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  animalType: string;
}

export const petService = {
  async listar(): Promise<Pet[]> {
    const response = await api.get('/pets');
    return response.data;
  },

  async criar(dados: Omit<Pet, 'id'>): Promise<Pet> {
    const response = await api.post('/pets', dados);
    return response.data;
  },

  async atualizar(id: string, dados: Omit<Pet, 'id'>): Promise<Pet> {
    const response = await api.put(`/pets/${id}`, dados);
    return response.data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/pets/${id}`);
  },
};

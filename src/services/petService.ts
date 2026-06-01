import api from '../lib/api';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  animalType: string;
  photoUrl?: string;
}

export interface PetInput {
  name: string;
  breed: string;
  age: number;
  weight: number;
  animalType: string;
  photoUri?: string;
}

function toFormData(dados: PetInput): FormData {
  const form = new FormData();
  form.append('name', dados.name);
  form.append('breed', dados.breed);
  form.append('age', String(dados.age));
  form.append('weight', String(dados.weight));
  form.append('animalType', dados.animalType);
  if (dados.photoUri) {
    const filename = dados.photoUri.split('/').pop() ?? 'photo.jpg';
    const ext = filename.split('.').pop() ?? 'jpg';
    form.append('photo', { uri: dados.photoUri, name: filename, type: `image/${ext}` } as any);
  }
  return form;
}

export const petService = {
  async listar(): Promise<Pet[]> {
    const response = await api.get('/pets');
    return response.data;
  },

  async criar(dados: PetInput): Promise<Pet> {
    const response = await api.post('/pets', toFormData(dados), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async atualizar(id: string, dados: PetInput): Promise<Pet> {
    const response = await api.put(`/pets/${id}`, toFormData(dados), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/pets/${id}`);
  },
};

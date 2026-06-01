import api from '../lib/api';

export interface Agendamento {
  id: string;
  service: string;
  preco?: number;
  tempoServico?: string;
  dataHoraAgendamento: string;
  unidade: string;
  enderecoUnidade?: string;
  unidadeTelefone?: string;
  unidadeWhatsapp?: string;
  unidadeId: string;
  petId?: string | null;
  petNome?: string | null;
  petAnimalType?: string | null;
  status: string;
  agendadoEm?: string;
}

export interface NovoAgendamento {
  service: string;
  preco?: number;
  tempoServico?: string;
  dataHoraAgendamento: string;
  unidadeId: string;
  petId?: string | null;
  petNome?: string | null;
  petAnimalType?: string | null;
}

export const agendamentoService = {
  async listar(params?: { futuro?: boolean; status?: string; limite?: number }): Promise<Agendamento[]> {
    const response = await api.get('/agendamentos', { params });
    return response.data;
  },

  async criar(dados: NovoAgendamento): Promise<Agendamento> {
    const response = await api.post('/agendamentos', dados);
    return response.data;
  },

  async atualizarStatus(id: string, status: string): Promise<Agendamento> {
    const response = await api.put(`/agendamentos/${id}`, { status });
    return response.data;
  },

  async horariosOcupados(data: string, unidadeId: string): Promise<string[]> {
    const response = await api.get('/agendamentos/horarios-ocupados', {
      params: { data, unidadeId },
    });
    return response.data.horarios ?? [];
  },
};

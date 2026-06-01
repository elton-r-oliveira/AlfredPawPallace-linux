import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import { style } from "./styles";

import { agendamentoService } from '../../services/agendamentoService';
import { unidadeService, Unidade } from '../../services/unidadeService';
import { petService } from '../../services/petService';

import { TabSwitch } from "../../components/TabSwitch";
import { AgendarServico } from "../../components/AgendarServico";
import { MeusAgendamentos } from "../../components/MeusAgendamentos";
import { ModalDetalhesAgendamento } from "../../components/ModalDetalhesAgendamento";

import { getPetSource } from "../../utils/petUtils";
import { themes } from "../../global/themes";

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const parseDate = (value: any): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export default function Agendar() {
  const [servico, setServico] = useState('');
  const [dataAgendamento, setDataAgendamento] = useState(new Date());
  const [showServiceList, setShowServiceList] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [petSelecionado, setPetSelecionado] = useState<any>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [abaAtual, setAbaAtual] = useState<'agendar' | 'meusAgendamentos'>('agendar');
  const [meusAgendamentos, setMeusAgendamentos] = useState<any[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<Unidade | null>(null);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const horariosFixos = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);

  useEffect(() => {
    const carregarUnidades = async () => {
      try {
        const lista = await unidadeService.listar();
        setUnidades(lista.filter(u => u.ativo).sort((a, b) => a.ordem - b.ordem));
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
        setUnidades([
          {
            id: 'fallback-1',
            nome: "Alfred Paw Palace - Santo André",
            endereco: "Av. Loreto, 238 - Jardim Santo André, Santo André - SP, 09132-410",
            telefone: "(11) 95075-2980",
            whatsapp: "(11) 97591-1800",
            ativo: true,
            ordem: 1,
          },
        ]);
      } finally {
        setLoadingUnidades(false);
      }
    };
    carregarUnidades();
  }, []);

  useEffect(() => {
    const carregarHorariosOcupados = async () => {
      if (!unidadeSelecionada) {
        setHorariosOcupados([]);
        return;
      }
      try {
        const dataStr = dataAgendamento.toISOString().split('T')[0];
        const horarios = await agendamentoService.horariosOcupados(dataStr, unidadeSelecionada.id);
        setHorariosOcupados(horarios);
      } catch (error) {
        console.error("Erro ao carregar horários ocupados:", error);
        setHorariosOcupados([]);
      }
    };

    if (abaAtual === 'agendar' && unidadeSelecionada) {
      carregarHorariosOcupados();
    } else {
      setHorariosOcupados([]);
    }
  }, [dataAgendamento, abaAtual, unidadeSelecionada]);

  const handleSelectService = (service: any) => {
    setServico(service.name);
    setServicoSelecionado(service);
    setShowServiceList(false);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setDataAgendamento(selectedDate || dataAgendamento);
  };

  const handleAgendar = async () => {
    if (!servicoSelecionado) {
      return Alert.alert('Atenção', 'Por favor, selecione o serviço.');
    }

    if (!unidadeSelecionada) {
      return Alert.alert('Atenção', 'Por favor, selecione uma unidade válida.');
    }

    const agora = new Date();
    if (dataAgendamento < agora) {
      return Alert.alert('Atenção', 'Não é possível agendar em um horário que já passou.');
    }

    const horarioSelecionado = formatTime(dataAgendamento);
    if (horariosOcupados.includes(horarioSelecionado)) {
      return Alert.alert('Atenção', 'Este horário já está ocupado. Por favor, escolha outro.');
    }

    try {
      await agendamentoService.criar({
        service: servicoSelecionado.name,
        preco: servicoSelecionado.price,
        tempoServico: servicoSelecionado.duration,
        dataHoraAgendamento: dataAgendamento.toISOString(),
        unidadeId: unidadeSelecionada.id,
        petId: petSelecionado?.id || null,
        petNome: petSelecionado?.name || null,
        petAnimalType: petSelecionado?.animalType || null,
      });

      Alert.alert('Sucesso', 'Seu agendamento foi realizado com sucesso!');
      setServico('');
      setServicoSelecionado(null);
      setDataAgendamento(new Date());
      setPetSelecionado(null);
      setUnidadeSelecionada(null);
    } catch (error) {
      console.error("Erro ao agendar:", error);
      Alert.alert('Erro', 'Não foi possível agendar o serviço. Tente novamente.');
    }
  };

  const abrirDetalhesAgendamento = (agendamento: any) => {
    setAgendamentoSelecionado({
      ...agendamento,
      dataHoraAgendamento: parseDate(agendamento.dataHoraAgendamento),
    });
    setModalDetalhesVisible(true);
  };

  useEffect(() => {
    const carregarPets = async () => {
      try {
        const lista = await petService.listar();
        setPets(lista);
      } catch (error) {
        console.error("Erro ao buscar pets:", error);
        Alert.alert("Erro", "Não foi possível carregar seus pets.");
      }
    };
    carregarPets();
  }, []);

  useEffect(() => {
    const carregarAgendamentos = async () => {
      try {
        setLoadingAgendamentos(true);
        const lista = await agendamentoService.listar();
        const listaMapped = lista.map(item => ({
          ...item,
          dataHoraAgendamento: new Date(item.dataHoraAgendamento),
        }));
        setMeusAgendamentos(listaMapped);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        Alert.alert("Erro", "Não foi possível carregar seus agendamentos.");
      } finally {
        setLoadingAgendamentos(false);
      }
    };

    if (abaAtual === 'meusAgendamentos') {
      carregarAgendamentos();
    }
  }, [abaAtual]);

  const cancelarAgendamento = async (agendamentoId: string) => {
    Alert.alert(
      "Cancelar Agendamento",
      "Tem certeza de que deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await agendamentoService.atualizarStatus(agendamentoId, "Cancelado");
              setMeusAgendamentos(prev =>
                prev.map(item =>
                  item.id === agendamentoId ? { ...item, status: "Cancelado" } : item
                )
              );
              setModalDetalhesVisible(false);
              Alert.alert("Agendamento cancelado com sucesso!");
            } catch (error) {
              console.error("Erro ao cancelar agendamento:", error);
              Alert.alert("Erro", "Não foi possível cancelar o agendamento.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: themes.telaHome.fundo,
      }}>
        <TabSwitch abaAtual={abaAtual} setAbaAtual={setAbaAtual} />
      </View>

      <ScrollView
        style={style.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 180, marginTop: 100 }}
      >
        {abaAtual === 'agendar' ? (
          <AgendarServico
            servico={servico}
            setServico={setServico}
            servicoSelecionado={servicoSelecionado}
            setServicoSelecionado={setServicoSelecionado}
            dataAgendamento={dataAgendamento}
            setDataAgendamento={setDataAgendamento}
            showServiceList={showServiceList}
            setShowServiceList={setShowServiceList}
            pets={pets}
            petSelecionado={petSelecionado}
            setPetSelecionado={setPetSelecionado}
            showPetModal={showPetModal}
            setShowPetModal={setShowPetModal}
            unidadeSelecionada={unidadeSelecionada}
            setUnidadeSelecionada={setUnidadeSelecionada}
            unidades={unidades}
            handleSelectService={handleSelectService}
            onChangeDate={onChangeDate}
            handleAgendar={handleAgendar}
            getPetImage={getPetSource}
            formatDate={formatDate}
            formatTime={formatTime}
            horariosFixos={horariosFixos}
            horariosOcupados={horariosOcupados}
          />
        ) : (
          <MeusAgendamentos
            meusAgendamentos={meusAgendamentos}
            loadingAgendamentos={loadingAgendamentos}
            abrirDetalhesAgendamento={abrirDetalhesAgendamento}
          />
        )}
      </ScrollView>

      {modalDetalhesVisible && agendamentoSelecionado && (
        <ModalDetalhesAgendamento
          modalDetalhesVisible={modalDetalhesVisible}
          setModalDetalhesVisible={setModalDetalhesVisible}
          agendamentoSelecionado={agendamentoSelecionado}
          unidades={unidades}
          getPetImage={getPetSource}
          onCancelarAgendamento={cancelarAgendamento}
        />
      )}
    </View>
  );
}

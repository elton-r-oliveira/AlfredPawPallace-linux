import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageSourcePropType } from "react-native";
import { style } from "./styles";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import TopBar from "../../components/topBar";
import { CarrosselNovidades, NovidadeCard } from "../../components/CarrosselNovidades";
import { useNavigation } from '@react-navigation/native';
import { BottomTabParamList } from '../../@types/types';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { agendamentoService } from "../../services/agendamentoService";
import { promocaoService, Promocao } from "../../services/promocaoService";

interface Agendamento {
  id: string;
  service: string;
  dataHoraAgendamento: Date;
  petNome: string;
  status: string;
  diasRestantes?: number;
}

export default function Home() {
  const navigation = useNavigation<any>();
  const { usuario } = useAuth();
  const [agendamentosRecentes, setAgendamentosRecentes] = useState<Agendamento[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
  const [novidadesCards, setNovidadesCards] = useState<NovidadeCard[]>([]);
  const [loadingPromocoes, setLoadingPromocoes] = useState(true);
  const insets = useSafeAreaInsets();

  const getImagemPorCategoria = (categoria: string): ImageSourcePropType => {
    const imagensMap: { [key: string]: ImageSourcePropType } = {
      'banho': require('../../assets/novidade1.png'),
      'tosa': require('../../assets/novidade1.png'),
      'vacinacao': require('../../assets/novidade3.png'),
      'consulta': require('../../assets/novidade3.png'),
      'daycare': require('../../assets/novidade2.png'),
      'produtos': require('../../assets/novidade4.png'),
      'outros': require('../../assets/novidade1.png'),
    };
    return imagensMap[categoria] || require('../../assets/novidade1.png');
  };

  const navigateTo = <T extends keyof BottomTabParamList>(routeName: T, params?: BottomTabParamList[T]) => {
    navigation.navigate(routeName, params);
  };

  const converterParaNovidadeCard = (promocao: Promocao): NovidadeCard => {
    const acao = () => {
      switch (promocao.categoria) {
        case 'banho':
        case 'tosa':
          navigateTo("Agendar", { categoria: promocao.categoria });
          break;
        case 'vacinacao':
          navigateTo("Saúde", { tela: 'vacinas' });
          break;
        case 'consulta':
          navigateTo("Saúde", { tela: 'consultas' });
          break;
        case 'daycare':
          navigateTo("Agendar", { servico: 'daycare' });
          break;
        case 'produtos':
          navigateTo("Saúde", { tela: 'produtos' });
          break;
        default:
          navigateTo("Pets");
      }
    };

    return {
      id: promocao.id,
      titulo: promocao.titulo,
      descricao: promocao.descricao,
      imagem: getImagemPorCategoria(promocao.categoria),
      corFundo: promocao.corFundo,
      acao,
    };
  };

  const getPromocoesFallback = (): NovidadeCard[] => [
    {
      id: '1',
      titulo: 'Banho Completo + Tosa Grátis',
      descricao: 'Na primeira visita ganhe uma tosa higiênica gratuita!',
      imagem: require('../../assets/novidade1.png'),
      corFundo: themes.colors.inputText,
      acao: () => navigateTo("Pets"),
    },
    {
      id: '2',
      titulo: 'Day Care Especial',
      descricao: 'Deixe seu pet conosco durante o dia com atividades recreativas',
      imagem: require('../../assets/novidade2.png'),
      corFundo: '#FF6B35',
      acao: () => navigateTo("Pets"),
    },
    {
      id: '3',
      titulo: 'Vacinação em Dia',
      descricao: 'Agende a vacinação do seu pet com 10% de desconto',
      imagem: require('../../assets/novidade3.png'),
      corFundo: '#4ECDC4',
      acao: () => navigateTo("Pets"),
    },
    {
      id: '4',
      titulo: 'Produtos Naturais',
      descricao: 'Nova linha de produtos naturais e orgânicos chegou!',
      imagem: require('../../assets/novidade4.png'),
      corFundo: '#45B7D1',
      acao: () => navigateTo("Pets"),
    },
  ];

  const calcularDiasRestantes = (dataAgendamento: Date): number => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAgend = new Date(dataAgendamento);
    dataAgend.setHours(0, 0, 0, 0);
    const diffTime = dataAgend.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const carregarAgendamentosRecentes = async () => {
    try {
      setLoadingAgendamentos(true);
      const data = await agendamentoService.listar({ futuro: true, status: 'Pendente,Confirmado', limite: 5 });

      const lista: Agendamento[] = data
        .map(item => ({
          id: item.id,
          service: item.service,
          dataHoraAgendamento: new Date(item.dataHoraAgendamento),
          petNome: item.petNome || "Pet",
          status: item.status,
          diasRestantes: calcularDiasRestantes(new Date(item.dataHoraAgendamento)),
        }))
        .filter(a => (a.diasRestantes ?? 0) >= 0);

      setAgendamentosRecentes(lista);
    } catch (error) {
      console.error("Erro ao carregar agendamentos recentes:", error);
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  const carregarPromocoes = async () => {
    setLoadingPromocoes(true);
    try {
      const data = await promocaoService.listar();
      if (data.length > 0) {
        const cards = data
          .sort((a, b) => a.ordem - b.ordem)
          .map(p => converterParaNovidadeCard(p));
        setNovidadesCards(cards);
      } else {
        setNovidadesCards(getPromocoesFallback());
      }
    } catch {
      setNovidadesCards(getPromocoesFallback());
    } finally {
      setLoadingPromocoes(false);
    }
  };

  const formatarData = (date: Date): string => date.toLocaleDateString('pt-BR');
  const formatarHora = (date: Date): string =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const getTextoDiasRestantes = (dias: number): string => {
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    if (dias > 1) return `Faltam ${dias} dias`;
    return "Data passada";
  };

  const getCorDiasRestantes = (dias: number): string => {
    if (dias === 0) return "#FF6B35";
    if (dias === 1) return "#FFA726";
    if (dias <= 3) return "#42A5F5";
    return "#4CAF50";
  };

  const temNotificacaoUrgente = (): boolean =>
    agendamentosRecentes.some(a => a.diasRestantes !== undefined && a.diasRestantes <= 3);

  useEffect(() => {
    carregarAgendamentosRecentes();
    carregarPromocoes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarAgendamentosRecentes();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: themes.telaHome.fundo }}>
      <View style={{ position: "absolute", left: 0, right: 0, zIndex: 10, backgroundColor: themes.telaHome.fundo }}>
        <TopBar
          userName={usuario?.nome || ""}
          location={usuario?.endereco || "Endereço não informado"}
          agendamentos={agendamentosRecentes}
          loadingAgendamentos={loadingAgendamentos}
          formatarData={formatarData}
          formatarHora={formatarHora}
          getTextoDiasRestantes={getTextoDiasRestantes}
          getCorDiasRestantes={getCorDiasRestantes}
          temNotificacaoUrgente={temNotificacaoUrgente()}
        />
      </View>

      <ScrollView
        style={style.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 120,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {loadingPromocoes ? (
          <View style={style.petCard}>
            <Text style={style.petService}>Carregando promoções...</Text>
          </View>
        ) : (
          <CarrosselNovidades cards={novidadesCards} />
        )}

        <Text style={style.sectionTitle}>O que você gostaria de fazer?</Text>

        <View style={style.quickActions}>
          <TouchableOpacity
            style={[style.actionBox, { backgroundColor: themes.telaHome.texto1 }]}
            onPress={() => navigateTo("Pets")}
          >
            <MaterialIcons name="add-circle-outline" size={35} color={themes.telaHome.fundo} />
            <Text style={[style.actionText, { color: themes.telaHome.fundo }]}>Meus Pets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.actionBox, { backgroundColor: themes.telaHome.fundo2 }]}
            onPress={() => navigateTo("Agendar", {})}
          >
            <FontAwesome name="calendar-plus-o" size={35} color={themes.telaHome.fundo} />
            <Text style={[style.actionText, { color: themes.telaHome.fundo }]}>Agendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.actionBox, { borderWidth: 3, borderColor: themes.telaHome.texto2 }]}
            onPress={() => navigateTo("Saúde", {})}
          >
            <Ionicons name="medical" size={35} color={themes.colors.iconeQuickAcess1} />
            <Text style={style.actionText}>Saúde</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.actionBox, { borderWidth: 3, borderColor: themes.telaHome.texto2 }]}
            onPress={() => navigateTo("Perfil")}
          >
            <Ionicons name="person-circle-outline" size={35} color={themes.telaHome.texto1} />
            <Text style={style.actionText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    Animated,
    Easing,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { style } from "./styles";
import { themes } from "../../global/themes";

interface Agendamento {
  id: string;
  service: string;
  dataHoraAgendamento: Date;
  petNome: string;
  status: string;
  diasRestantes?: number;
}

interface TopBarProps {
    userName: string;
    location: string;
    agendamentos: Agendamento[];
    loadingAgendamentos: boolean;
    formatarData: (date: Date) => string;
    formatarHora: (date: Date) => string;
    getTextoDiasRestantes: (dias: number) => string;
    getCorDiasRestantes: (dias: number) => string;
    temNotificacaoUrgente: boolean;
}

export default function TopBar({
    userName,
    location,
    agendamentos,
    loadingAgendamentos,
    formatarData,
    formatarHora,
    getTextoDiasRestantes,
    getCorDiasRestantes,
    temNotificacaoUrgente
}: TopBarProps) {
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const slideAnimNotif = useRef(new Animated.Value(-300)).current;

    const openNotifModal = () => {
        setNotificationModalVisible(true);
        Animated.timing(slideAnimNotif, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeNotifModal = () => {
        Animated.timing(slideAnimNotif, {
            toValue: -300,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => setNotificationModalVisible(false));
    };

     return (
        <View style={style.header}>
            
            {/* LOGO */}
            <TouchableOpacity>
                <Image
                    source={require("../../assets/logo.png")}
                    style={{ width: 80, height: 80, resizeMode: "contain" }}
                />
            </TouchableOpacity>

            <View style={[style.headerText, { flex: 1, alignItems: 'flex-start' }]}>
                <Text style={style.hello}>Olá!</Text>
                <Text style={style.userName}>{userName || "Visitante"}</Text>
            </View>

            {/* Sino com indicador de urgência */}
            <TouchableOpacity onPress={openNotifModal} style={{ position: "relative" }}>
                <Ionicons
                    name="notifications-outline"
                    size={28}
                    color={themes.colors.bgScreen}
                />
                {temNotificacaoUrgente && agendamentos.length > 0 && (
                    <View style={style.urgentBadge}>
                        <Text style={style.urgentBadgeText}>!</Text>
                    </View>
                )}
                {!temNotificacaoUrgente && agendamentos.length > 0 && (
                    <View style={style.normalBadge}>
                        <Text style={style.normalBadgeText}>{agendamentos.length}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* MODAL NOTIFICAÇÕES */}
            <Modal transparent visible={notificationModalVisible} animationType="none" onRequestClose={closeNotifModal}>
                <TouchableOpacity
                    style={style.overlay}
                    activeOpacity={1}
                    onPressOut={closeNotifModal}
                >
                    <Animated.View
                        style={[
                            style.modalContent,
                            { transform: [{ translateY: slideAnimNotif }] },
                        ]}
                    >
                        <Text style={style.title}>Próximos Agendamentos</Text>
                        
                        {/* Agendamentos */}
                        {loadingAgendamentos ? (
                            <Text style={style.item}>Carregando agendamentos...</Text>
                        ) : agendamentos.length === 0 ? (
                            <Text style={style.item}>Nenhum agendamento futuro</Text>
                        ) : (
                            agendamentos.map((agendamento) => {
                                const isUrgente = agendamento.diasRestantes !== undefined && agendamento.diasRestantes <= 3;
                                
                                return (
                                    <View key={agendamento.id} style={{ 
                                        marginBottom: 15,
                                        padding: 12,
                                        backgroundColor: isUrgente ? '#FFF3E0' : '#F5F5F5',
                                        borderRadius: 8,
                                        borderLeftWidth: 4,
                                        borderLeftColor: isUrgente ? '#FF9800' : '#4CAF50'
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: 'bold',
                                                    color: '#333',
                                                    marginBottom: 4
                                                }}>
                                                    {agendamento.service} - {agendamento.petNome}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 14,
                                                    color: '#666',
                                                    marginBottom: 4
                                                }}>
                                                    📅 {formatarData(agendamento.dataHoraAgendamento)} às {formatarHora(agendamento.dataHoraAgendamento)}
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: getCorDiasRestantes(agendamento.diasRestantes || 0),
                                                fontWeight: 'bold',
                                                fontSize: 14,
                                                marginLeft: 8
                                            }}>
                                                {getTextoDiasRestantes(agendamento.diasRestantes || 0)}
                                            </Text>
                                        </View>
                                        <Text style={{
                                            color: '#666',
                                            fontSize: 12,
                                            marginTop: 4
                                        }}>
                                            Status: {agendamento.status}
                                        </Text>
                                        {isUrgente && (
                                            <Text style={{
                                                color: '#FF9800',
                                                fontSize: 12,
                                                fontWeight: 'bold',
                                                marginTop: 4
                                            }}>
                                                ⚠️ Agendamento próximo
                                            </Text>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
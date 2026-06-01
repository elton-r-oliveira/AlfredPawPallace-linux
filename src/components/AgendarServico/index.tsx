import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { style } from "./styles"
import { CustomCalendar } from "../CustomCalendar";
import PetSelectorModal from "../PetSelectorModal";
import ServiceSelectorModal, { Service } from "../ServiceSelectorModal";
import { PawLoader } from '../PawLoader';
import { servicoService } from '../../services/servicoService';

export interface AgendarServicoProps {
    servico: string;
    setServico: (servico: string) => void;
    servicoSelecionado: any;
    setServicoSelecionado: (servico: any) => void;
    dataAgendamento: Date;
    setDataAgendamento: (date: Date) => void;
    showServiceList: boolean;
    setShowServiceList: (show: boolean) => void;
    pets: any[];
    petSelecionado: any;
    setPetSelecionado: (pet: any) => void;
    showPetModal: boolean;
    setShowPetModal: (show: boolean) => void;
    unidadeSelecionada: any;
    setUnidadeSelecionada: (unidade: any) => void;
    unidades: any[];
    handleSelectService: (service: any) => void;
    onChangeDate: (event: any, selectedDate?: Date) => void;
    handleAgendar: () => void;
    getPetImage: (animalType: string, photoUrl?: string) => any;
    formatDate: (date: Date) => string;
    formatTime: (date: Date) => string;
    horariosFixos: string[];
    horariosOcupados: string[];
}

const isHorarioPassado = (dataAgendamento: Date, horario: string): boolean => {
    const hoje = new Date();
    const dataSelecionada = new Date(dataAgendamento);

    if (dataSelecionada.getDay() === 0) return true;

    const mesmoDia =
        dataSelecionada.getDate() === hoje.getDate() &&
        dataSelecionada.getMonth() === hoje.getMonth() &&
        dataSelecionada.getFullYear() === hoje.getFullYear();

    if (!mesmoDia) return false;

    const [horaStr, minutoStr] = horario.split(':');
    const horarioCompleto = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        parseInt(horaStr, 10),
        parseInt(minutoStr, 10)
    );

    return horarioCompleto < hoje;
};

const openInGoogleMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(label)}`;
    Linking.openURL(url);
};

export const AgendarServico: React.FC<AgendarServicoProps> = ({
    servico,
    setServico,
    dataAgendamento,
    setDataAgendamento,
    setServicoSelecionado,
    showServiceList,
    setShowServiceList,
    pets,
    petSelecionado,
    setPetSelecionado,
    showPetModal,
    setShowPetModal,
    unidadeSelecionada,
    setUnidadeSelecionada,
    unidades,
    handleAgendar,
    getPetImage,
    formatDate,
    formatTime,
    horariosFixos,
    horariosOcupados
}) => {
    const [showCustomCalendar, setShowCustomCalendar] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [servicosDisponiveis, setServicosDisponiveis] = useState<Service[]>([]);
    const [loadingServicos, setLoadingServicos] = useState(true);

    useEffect(() => {
        servicoService.listar()
            .then(lista => {
                const mapped: Service[] = lista.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    price: typeof s.price === 'number' ? s.price.toFixed(2) : String(s.price),
                    duration: s.duration,
                    icon: s.icon || 'cut-outline',
                    description: s.description || '',
                }));
                setServicosDisponiveis(mapped);
            })
            .catch(() => setServicosDisponiveis([]))
            .finally(() => setLoadingServicos(false));
    }, []);

    useEffect(() => {
        const novaData = new Date(dataAgendamento);
        novaData.setHours(0, 0, 0, 0);
        setDataAgendamento(novaData);
    }, [unidadeSelecionada]);

    useEffect(() => {
        if (servico) {
            const service = servicosDisponiveis.find(s => s.name === servico);
            setSelectedService(service || null);
        } else {
            setSelectedService(null);
        }
    }, [servico, servicosDisponiveis]);

    const handleDateSelect = (date: Date) => {
        setDataAgendamento(date);
        setShowCustomCalendar(false);
    };

    return (
        <>
            <Text style={style.sectionTitle}>Agendar Serviço</Text>
            <Text style={style.sectionSubtitle}>Selecione o tipo de serviço, a data e o horário desejados para o seu pet.</Text>

            <View style={style.formContainer}>
                {/* Serviço */}
                <View style={[style.inputGroup, style.serviceDropdownContainer]}>
                    <Text style={style.inputLabel}>Tipo de Serviço</Text>
                    <TouchableOpacity
                        style={style.selectInput}
                        onPress={() => setShowServiceList(true)}
                        disabled={loadingServicos}
                    >
                        <Ionicons
                            name={(selectedService?.icon ?? "cut-outline") as React.ComponentProps<typeof Ionicons>['name']}
                            size={20}
                            color={themes.colors.secundary}
                            style={style.inputIcon}
                        />
                        <View style={{ flex: 1, justifyContent: 'center', minHeight: 40 }}>
                            {loadingServicos ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minHeight: 40 }}>
                                    <View style={{ marginTop: 45 }}>
                                        <PawLoader size={15} color={themes.colors.secundary} />
                                    </View>
                                </View>
                            ) : selectedService ? (
                                <Text
                                    style={[style.selectInputText, { color: themes.colors.secundary, fontWeight: '600', textAlignVertical: 'center', includeFontPadding: false, lineHeight: 20 }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {selectedService.name} • R$ {selectedService.price} • {selectedService.duration}
                                </Text>
                            ) : (
                                <Text
                                    style={[style.selectInputText, { color: '#888', fontWeight: '400', textAlignVertical: 'center', includeFontPadding: false, lineHeight: 20 }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    Escolha o Serviço...
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <ServiceSelectorModal
                    visible={showServiceList}
                    services={servicosDisponiveis}
                    selectedService={selectedService}
                    onSelectService={(service) => setSelectedService(service)}
                    onConfirm={(service) => {
                        if (service) {
                            setSelectedService(service);
                            setServico(service.name);
                            setServicoSelecionado(service);
                        }
                        setShowServiceList(false);
                    }}
                    onClose={() => setShowServiceList(false)}
                />

                {/* Data e Pet lado a lado */}
                <View style={style.dateTimeContainer}>
                    <View style={[style.inputGroup, style.halfInput]}>
                        <Text style={style.inputLabel}>Data</Text>
                        <TouchableOpacity
                            style={style.selectInput}
                            onPress={() => setShowCustomCalendar(true)}
                        >
                            <MaterialIcons name="date-range" size={20} color={themes.colors.secundary} style={style.inputIcon} />
                            <Text style={[style.selectInputText, { color: themes.colors.secundary, fontWeight: '600' }]}>
                                {formatDate(dataAgendamento)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[style.inputGroup, style.halfInput]}>
                        <Text style={style.inputLabel}>Selecione o Pet</Text>
                        <TouchableOpacity
                            style={style.selectInput}
                            onPress={() => setShowPetModal(true)}
                        >
                            <Ionicons name="paw-outline" size={20} color={themes.colors.secundary} style={style.inputIcon} />
                            {petSelecionado ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={getPetImage(petSelecionado?.animalType || "dog", petSelecionado?.photoUrl)}
                                        style={{ width: 24, height: 24, marginRight: 8, borderRadius: 12 }}
                                    />
                                    <Text style={[style.selectInputText, { color: themes.colors.secundary, fontWeight: '600' }]}>
                                        {petSelecionado.name}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[style.selectInputText, { color: '#888', fontWeight: '400' }]}>
                                    Escolha o Pet...
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <CustomCalendar
                    visible={showCustomCalendar}
                    onClose={() => setShowCustomCalendar(false)}
                    onDateSelect={handleDateSelect}
                    selectedDate={dataAgendamento}
                />

                {/* Horários Disponíveis */}
                <View style={style.inputGroup}>
                    <Text style={style.inputLabel}>
                        Horários Disponíveis {unidadeSelecionada ? `- ${unidadeSelecionada.nome}` : ''}
                    </Text>

                    {!unidadeSelecionada ? (
                        <Text style={{ color: '#888', textAlign: 'center', marginVertical: 20 }}>
                            Selecione uma unidade para ver os horários disponíveis
                        </Text>
                    ) : horariosFixos.length === 0 ? (
                        <Text style={{ color: '#888', textAlign: 'center', marginVertical: 20 }}>
                            Nenhum horário disponível para este dia
                        </Text>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}
                        >
                            {horariosFixos.map((hora) => {
                                const isOcupado = horariosOcupados.includes(hora);
                                const isPassado = isHorarioPassado(dataAgendamento, hora);
                                const isDesabilitado = isOcupado || isPassado;
                                const isSelecionado = formatTime(dataAgendamento) === hora;

                                return (
                                    <TouchableOpacity
                                        key={hora}
                                        disabled={isDesabilitado}
                                        onPress={() => {
                                            if (!isDesabilitado) {
                                                const [h, m] = hora.split(':');
                                                const novaData = new Date(dataAgendamento);
                                                novaData.setHours(Number(h));
                                                novaData.setMinutes(Number(m));
                                                setDataAgendamento(novaData);
                                            }
                                        }}
                                        style={{
                                            paddingVertical: 10,
                                            paddingHorizontal: 18,
                                            borderRadius: 8,
                                            backgroundColor: isSelecionado
                                                ? themes.colors.secundary
                                                : isDesabilitado ? '#ccc' : '#fff',
                                            borderWidth: 1,
                                            borderColor: isSelecionado ? themes.colors.secundary : '#ddd',
                                            opacity: isDesabilitado ? 0.6 : 1,
                                        }}
                                    >
                                        <Text style={{
                                            color: isDesabilitado ? '#999' : isSelecionado ? '#fff' : themes.colors.corTexto,
                                            fontWeight: isSelecionado ? '700' : '500',
                                        }}>
                                            {hora}
                                            {isOcupado && " 🔒"}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Modal de Pets */}
                <PetSelectorModal
                    visible={showPetModal}
                    pets={pets}
                    onSelectPet={(pet) => {
                        setPetSelecionado(pet);
                        setShowPetModal(false);
                    }}
                    onClose={() => setShowPetModal(false)}
                />

                {/* Unidades */}
                <View style={style.inputGroup}>
                    <Text style={style.inputLabel}>Selecione a Unidade</Text>

                    {unidades.length === 0 ? (
                        <Text style={{ color: '#888', textAlign: 'center', marginVertical: 20 }}>
                            Nenhuma unidade disponível no momento
                        </Text>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ flexDirection: "row", gap: 16, paddingVertical: 10 }}
                        >
                            {unidades.map((unidade, index) => (
                                <TouchableOpacity
                                    key={unidade.id || index}
                                    activeOpacity={0.9}
                                    onPress={() => setUnidadeSelecionada(unidade)}
                                    style={{
                                        width: 250,
                                        backgroundColor: unidadeSelecionada?.id === unidade.id ? themes.colors.secundary : "#fff",
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        borderWidth: 2,
                                        borderColor: unidadeSelecionada?.id === unidade.id ? themes.colors.corTexto : "#ddd",
                                        shadowColor: "#000",
                                        shadowOpacity: 0.15,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                >
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ fontWeight: "700", fontSize: 16, color: unidadeSelecionada?.id === unidade.id ? "#fff" : "#333" }}>
                                            {unidade.nome}
                                        </Text>
                                        <Text style={{ fontSize: 13, color: unidadeSelecionada?.id === unidade.id ? "#f1f1f1" : "#777" }}>
                                            {unidade.endereco}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={{ height: 140 }}
                                        onPress={() => openInGoogleMaps(unidade.lat, unidade.lng, unidade.nome)}
                                    >
                                        <View style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderTopWidth: 1,
                                            borderTopColor: unidadeSelecionada?.id === unidade.id ? '#d1e7ff' : '#e9ecef',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            <Image
                                                source={require('../../assets/map-background.png')}
                                                style={{ width: '100%', height: '100%', position: 'absolute' }}
                                                resizeMode="cover"
                                            />
                                            <View style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: unidadeSelecionada?.id === unidade.id ? 'rgba(0, 0, 0, 0.7)' : ''
                                            }} />
                                            <View style={{ alignItems: 'center', zIndex: 1 }}>
                                                <Ionicons name="map" size={32} color="#fff" />
                                                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' }}>
                                                    Ver no Mapa
                                                </Text>
                                                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4, textAlign: 'center' }}>
                                                    Toque para navegar
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Botão de Agendar */}
                <TouchableOpacity
                    style={[style.button, {
                        opacity: (!selectedService || !petSelecionado || !unidadeSelecionada || horariosOcupados.includes(formatTime(dataAgendamento))) ? 0.6 : 1
                    }]}
                    onPress={handleAgendar}
                    disabled={!selectedService || !petSelecionado || !unidadeSelecionada || horariosOcupados.includes(formatTime(dataAgendamento))}
                >
                    <Text style={style.buttonText}>
                        {horariosOcupados.includes(formatTime(dataAgendamento))
                            ? "Horário Indisponível"
                            : "Confirmar Agendamento"
                        }
                    </Text>
                    <MaterialIcons name="done-all" size={24} color="#fff" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </View>
        </>
    );
};

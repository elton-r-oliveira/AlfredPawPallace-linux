import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, FlatList, ActivityIndicator } from "react-native";
import { style } from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";

import { useAuth } from "../../contexts/AuthContext";
import { saudeService } from "../../services/saudeService";
import { petService } from "../../services/petService";

import HealthRecordModal from '../../components/HealthRecordModal';
import PetSelectorModal from '../../components/PetSelectorModal';

import { getPetSource, getTypeLabel, formatDate } from '../../utils/petUtils';
import { HealthRecord } from "../../@types/HealthRecord";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  animalType: string;
  photoUrl?: string;
}

export default function Saude() {
  const { usuario } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showHealthRecordModal, setShowHealthRecordModal] = useState(false);
  const [healthRecordModalMode, setHealthRecordModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecordType, setCurrentRecordType] = useState<'vaccine' | 'dewormer' | 'antiparasitic'>('vaccine');
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const lista = await petService.listar();
      setPets(lista);
      if (lista.length > 0) {
        setSelectedPet(lista[0]);
        await fetchHealthRecords(lista[0].id);
      } else {
        setSelectedPet(null);
        setHealthRecords([]);
      }
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      Alert.alert("Erro", "Não foi possível carregar seus pets.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthRecords = async (petId: string) => {
    setLoading(true);
    try {
      const records = await saudeService.listar(petId);
      setHealthRecords(records);
    } catch (error) {
      console.error("Erro ao carregar registros de saúde:", error);
      Alert.alert("Erro", "Não foi possível carregar os registros de saúde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) fetchPets();
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      if (usuario) fetchPets();
    }, [usuario])
  );

  const openAddModal = (type: 'vaccine' | 'dewormer' | 'antiparasitic') => {
    setCurrentRecordType(type);
    setHealthRecordModalMode('add');
    setEditingRecord(null);
    setShowHealthRecordModal(true);
  };

  const openEditModal = (record: HealthRecord) => {
    setEditingRecord(record);
    setCurrentRecordType(record.type);
    setHealthRecordModalMode('edit');
    setShowHealthRecordModal(true);
  };

  const handlePetSelect = async (pet: Pet) => {
    setSelectedPet(pet);
    setShowPetSelector(false);
    await fetchHealthRecords(pet.id);
  };

  const handleAddRecord = async (recordData: Omit<HealthRecord, 'id' | 'petId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedPet || !usuario) {
      return Alert.alert('Erro', 'Nenhum pet selecionado ou usuário não autenticado.');
    }

    setSaving(true);
    try {
      const newRecord = await saudeService.criar({
        type: recordData.type,
        name: recordData.name,
        date: recordData.date,
        nextDate: recordData.nextDate || null,
        notes: recordData.notes || null,
        petId: selectedPet.id,
      });
      setHealthRecords(prev => [newRecord, ...prev]);
      Alert.alert('Sucesso', `${getTypeLabel(recordData.type)} adicionado com sucesso!`);
      setShowHealthRecordModal(false);
    } catch (error) {
      console.error("Erro ao adicionar registro:", error);
      Alert.alert('Erro', 'Não foi possível adicionar o registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecord = async (recordData: Omit<HealthRecord, 'userId' | 'petId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingRecord) return;
    setSaving(true);
    try {
      const updated = await saudeService.atualizar(editingRecord.id, {
        name: recordData.name,
        date: recordData.date,
        nextDate: recordData.nextDate || null,
        notes: recordData.notes || null,
      });
      setHealthRecords(prev =>
        prev.map(record => record.id === editingRecord.id ? updated : record)
      );
      Alert.alert('Sucesso', `${getTypeLabel(editingRecord.type)} atualizado com sucesso!`);
      setShowHealthRecordModal(false);
    } catch (error) {
      console.error("Erro ao editar registro:", error);
      Alert.alert('Erro', 'Não foi possível editar o registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = (record: HealthRecord) => {
    Alert.alert(
      'Excluir Registro',
      `Tem certeza que deseja excluir "${record.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await saudeService.deletar(record.id);
              setHealthRecords(prev => prev.filter(r => r.id !== record.id));
              Alert.alert('Sucesso', 'Registro excluído com sucesso!');
            } catch (error) {
              console.error("Erro ao excluir registro:", error);
              Alert.alert('Erro', 'Não foi possível excluir o registro.');
            }
          },
        },
      ]
    );
  };

  const getRecordsByType = (type: 'vaccine' | 'dewormer' | 'antiparasitic') =>
    healthRecords.filter(record => record.type === type);

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: themes.telaHome.fundo,
        paddingHorizontal: 15,
      }}>
        <Text style={style.sectionTitle}>Saúde do Pet</Text>

        <TouchableOpacity style={style.petSelector} onPress={() => setShowPetSelector(true)}>
          <View style={style.petSelectorContent}>
            {selectedPet ? (
              <>
                <Image source={getPetSource(selectedPet.animalType, selectedPet.photoUrl)} style={style.petSelectorImage} />
                <View style={style.petSelectorInfo}>
                  <Text style={style.petSelectorName}>{selectedPet.name}</Text>
                  <Text style={style.petSelectorDetails}>{selectedPet.breed} • {selectedPet.age} anos</Text>
                </View>
              </>
            ) : (
              <Text style={style.petSelectorPlaceholder}>Selecione um pet</Text>
            )}
            <MaterialIcons name="arrow-drop-down" size={24} color={themes.colors.secundary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={style.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 300, marginTop: 210 }}
      >
        {loading && (
          <View style={style.emptyStateContainer}>
            <ActivityIndicator size="large" color={themes.colors.secundary} />
            <Text style={style.emptyStateText}>Carregando registros...</Text>
          </View>
        )}

        {selectedPet && !loading && (
          <View style={style.healthCardsContainer}>
            {/* Card Vacinas */}
            <View style={style.healthCard}>
              <View style={style.healthCardHeader}>
                <View style={[style.healthIcon, { backgroundColor: themes.colors.vaccine }]}>
                  <MaterialIcons name="vaccines" size={24} color="#fff" />
                </View>
                <Text style={style.healthCardTitle}>Vacinas</Text>
                <TouchableOpacity style={style.addButton} onPress={() => openAddModal('vaccine')}>
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {getRecordsByType('vaccine').length > 0 ? (
                <FlatList
                  data={getRecordsByType('vaccine')}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={style.recordItem}>
                      <View style={style.recordHeader}>
                        <Text style={style.recordName}>{item.name}</Text>
                        <View style={style.recordActions}>
                          <TouchableOpacity style={style.editButton} onPress={() => openEditModal(item)}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity style={style.deleteButton} onPress={() => handleDeleteRecord(item)}>
                            <MaterialIcons name="delete" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={style.recordDetails}>
                        <Text style={style.recordDate}>Aplicada: {formatDate(item.date)}</Text>
                        {item.nextDate && <Text style={style.recordNextDate}>Próxima: {formatDate(item.nextDate)}</Text>}
                      </View>
                      {item.notes && <Text style={style.recordNotes}>{item.notes}</Text>}
                    </View>
                  )}
                />
              ) : (
                <Text style={style.emptyText}>Nenhuma vacina registrada</Text>
              )}
            </View>

            {/* Card Vermífugos */}
            <View style={style.healthCard}>
              <View style={style.healthCardHeader}>
                <View style={[style.healthIcon, { backgroundColor: themes.colors.dewormer }]}>
                  <MaterialIcons name="medication" size={24} color="#fff" />
                </View>
                <Text style={style.healthCardTitle}>Vermífugos</Text>
                <TouchableOpacity style={style.addButton} onPress={() => openAddModal('dewormer')}>
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {getRecordsByType('dewormer').length > 0 ? (
                <FlatList
                  data={getRecordsByType('dewormer')}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={style.recordItem}>
                      <View style={style.recordHeader}>
                        <Text style={style.recordName}>{item.name}</Text>
                        <View style={style.recordActions}>
                          <TouchableOpacity style={style.editButton} onPress={() => openEditModal(item)}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity style={style.deleteButton} onPress={() => handleDeleteRecord(item)}>
                            <MaterialIcons name="delete" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={style.recordDetails}>
                        <Text style={style.recordDate}>Aplicado: {formatDate(item.date)}</Text>
                        {item.nextDate && <Text style={style.recordNextDate}>Próximo: {formatDate(item.nextDate)}</Text>}
                      </View>
                    </View>
                  )}
                />
              ) : (
                <Text style={style.emptyText}>Nenhum vermífugo registrado</Text>
              )}
            </View>

            {/* Card Antiparasitários */}
            <View style={style.healthCard}>
              <View style={style.healthCardHeader}>
                <View style={[style.healthIcon, { backgroundColor: themes.colors.antiparasitic }]}>
                  <MaterialIcons name="pest-control" size={24} color="#fff" />
                </View>
                <Text style={style.healthCardTitle}>Antiparasitários</Text>
                <TouchableOpacity style={style.addButton} onPress={() => openAddModal('antiparasitic')}>
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {getRecordsByType('antiparasitic').length > 0 ? (
                <FlatList
                  data={getRecordsByType('antiparasitic')}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={style.recordItem}>
                      <View style={style.recordHeader}>
                        <Text style={style.recordName}>{item.name}</Text>
                        <View style={style.recordActions}>
                          <TouchableOpacity style={style.editButton} onPress={() => openEditModal(item)}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity style={style.deleteButton} onPress={() => handleDeleteRecord(item)}>
                            <MaterialIcons name="delete" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={style.recordDetails}>
                        <Text style={style.recordDate}>Aplicado: {formatDate(item.date)}</Text>
                        {item.nextDate && <Text style={style.recordNextDate}>Próximo: {formatDate(item.nextDate)}</Text>}
                      </View>
                    </View>
                  )}
                />
              ) : (
                <Text style={style.emptyText}>Nenhum antiparasitário registrado</Text>
              )}
            </View>
          </View>
        )}

        {!selectedPet && pets.length === 0 && !loading && (
          <View style={style.emptyStateContainer}>
            <Text style={style.emptyStateText}>Cadastre um pet primeiro para gerenciar a saúde.</Text>
          </View>
        )}
      </ScrollView>

      <PetSelectorModal
        visible={showPetSelector}
        pets={pets}
        onSelectPet={handlePetSelect}
        onClose={() => setShowPetSelector(false)}
      />

      <HealthRecordModal
        visible={showHealthRecordModal}
        mode={healthRecordModalMode}
        recordType={currentRecordType}
        record={editingRecord}
        onClose={() => setShowHealthRecordModal(false)}
        onSave={handleAddRecord}
        onUpdate={handleUpdateRecord}
        loading={saving}
      />
    </View>
  );
}

// components/PetSelectorModal.tsx
import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    Modal,
} from 'react-native';
import { style } from './styles';
import { getPetSource } from '../../utils/petUtils';

interface Pet {
    id: string;
    name: string;
    breed: string;
    age: number;
    weight: number;
    animalType: string;
    photoUrl?: string;
}

interface PetSelectorModalProps {
    visible: boolean;
    pets: Pet[];
    onSelectPet: (pet: Pet) => void;
    onClose: () => void;
}

export default function PetSelectorModal({
    visible,
    pets,
    onSelectPet,
    onClose
}: PetSelectorModalProps) {
    // ❌ REMOVA a função getPetImage daqui - agora usamos a do utilitário

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={style.modalOverlay}>
                <View style={style.modalContent}>
                    <Text style={style.modalTitle}>Selecione um Pet</Text>
                    
                    {pets.length === 0 ? (
                        <Text style={style.emptyText}>Nenhum pet cadastrado</Text>
                    ) : (
                        <FlatList
                            data={pets}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={style.petOption}
                                    onPress={() => onSelectPet(item)}
                                >
                                    <Image
                                        source={getPetSource(item.animalType, item.photoUrl)}
                                        style={style.petOptionImage}
                                    />
                                    <View style={style.petOptionInfo}>
                                        <Text style={style.petOptionName}>{item.name}</Text>
                                        <Text style={style.petOptionDetails}>
                                            {item.breed} • {item.age} anos
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    )}
                    
                    <TouchableOpacity
                        style={style.closeButton}
                        onPress={onClose}
                    >
                        <Text style={style.closeButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
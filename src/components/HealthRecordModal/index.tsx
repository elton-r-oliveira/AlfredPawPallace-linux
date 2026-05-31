// components/HealthRecordModal.tsx
import React from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { themes } from '../../global/themes';
import { style } from './styles';
import { HealthRecord } from "../../@types/HealthRecord";

interface HealthRecordModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  recordType: 'vaccine' | 'dewormer' | 'antiparasitic';
  record?: HealthRecord | null;
  onClose: () => void;
  onSave: (recordData: Omit<HealthRecord, 'id' | 'petId' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (recordData: Omit<HealthRecord, 'userId' | 'petId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loading: boolean;
}

// Função para aplicar máscara de data no formato DD/MM/AAAA
const formatDate = (text: string): string => {
  // Remove tudo que não é número
  const numbers = text.replace(/\D/g, '');
  
  // Limita a 8 dígitos (DDMMAAAA)
  const limited = numbers.slice(0, 8);
  
  // Aplica a formatação
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.slice(0, 2)}/${limited.slice(2)}`;
  } else {
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4, 8)}`;
  }
};

// Função para converter formato DD/MM/AAAA para AAAA-MM-DD (para o banco)
const toDatabaseFormat = (formattedDate: string): string => {
  if (formattedDate.length === 10) { // DD/MM/AAAA completo
    const [day, month, year] = formattedDate.split('/');
    return `${year}-${month}-${day}`;
  }
  return formattedDate; // Retorna como está se não estiver completo
};

// Função para converter formato AAAA-MM-DD para DD/MM/AAAA (para exibição)
const toDisplayFormat = (dbDate: string): string => {
  if (dbDate && dbDate.includes('-')) {
    const [year, month, day] = dbDate.split('-');
    return `${day}/${month}/${year}`;
  }
  return dbDate || '';
};

export default function HealthRecordModal({
    visible,
    mode,
    recordType,
    record,
    onClose,
    onSave,
    onUpdate
}: HealthRecordModalProps) {
    const [recordName, setRecordName] = React.useState(record?.name || '');
    const [recordDate, setRecordDate] = React.useState(toDisplayFormat(record?.date || ''));
    const [recordNextDate, setRecordNextDate] = React.useState(toDisplayFormat(record?.nextDate || ''));
    const [recordNotes, setRecordNotes] = React.useState(record?.notes || '');

    React.useEffect(() => {
        if (record) {
            setRecordName(record.name);
            setRecordDate(toDisplayFormat(record.date));
            setRecordNextDate(toDisplayFormat(record.nextDate || ''));
            setRecordNotes(record.notes || '');
        }
    }, [record]);

    const getTypeLabel = (type: 'vaccine' | 'dewormer' | 'antiparasitic') => {
        switch (type) {
            case 'vaccine': return 'Vacina';
            case 'dewormer': return 'Vermífugo';
            case 'antiparasitic': return 'Antiparasitário';
            default: return 'Registro';
        }
    };

    const handleSubmit = () => {
        // Converte para formato do banco de dados
        const dbRecordDate = toDatabaseFormat(recordDate);
        const dbRecordNextDate = recordNextDate ? toDatabaseFormat(recordNextDate) : undefined;

        if (!recordName || !dbRecordDate) {
            Alert.alert('Atenção', 'Por favor, preencha pelo menos o nome e a data.');
            return;
        }

        // Valida se a data está no formato correto
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dbRecordDate)) {
            Alert.alert('Atenção', 'Por favor, insira uma data válida no formato DD/MM/AAAA.');
            return;
        }

        const recordData = {
            type: recordType,
            name: recordName,
            date: dbRecordDate,
            nextDate: dbRecordNextDate,
            notes: recordNotes || undefined,
        };

        if (mode === 'add') {
            onSave(recordData);
        } else if (mode === 'edit' && record) {
            onUpdate?.({ ...recordData, id: record.id });
        }

        // Limpar formulário
        setRecordName('');
        setRecordDate('');
        setRecordNextDate('');
        setRecordNotes('');
    };

    const handleClose = () => {
        onClose();
        // Limpar formulário ao fechar
        setRecordName('');
        setRecordDate('');
        setRecordNextDate('');
        setRecordNotes('');
    };

    // Funções para lidar com a mudança de texto com formatação
    const handleDateChange = (text: string) => {
        const formatted = formatDate(text);
        setRecordDate(formatted);
    };

    const handleNextDateChange = (text: string) => {
        const formatted = formatDate(text);
        setRecordNextDate(formatted);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={style.modalOverlay}>
                <View style={style.formModalContent}>
                    <Text style={style.modalTitle}>
                        {mode === 'add' ? 'Adicionar' : 'Editar'} {getTypeLabel(recordType)}
                    </Text>

                    <ScrollView style={style.formContainer}>
                        <View style={style.inputGroup}>
                            <Text style={style.inputLabel}>Nome *</Text>
                            <TextInput
                                style={style.textInput}
                                placeholder={`Ex: ${recordType === 'vaccine' ? 'Vacina V10' : recordType === 'dewormer' ? 'Vermífugo Plus' : 'Antipulgas'}`}
                                value={recordName}
                                onChangeText={setRecordName}
                            />
                        </View>

                        <View style={style.inputGroup}>
                            <Text style={style.inputLabel}>Data de Aplicação *</Text>
                            <TextInput
                                style={style.textInput}
                                placeholder="DD/MM/AAAA"
                                value={recordDate}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10} // DD/MM/AAAA tem 10 caracteres
                            />
                            <Text style={style.inputHelp}>Formato: Dia/Mês/Ano (ex: 15/03/2024)</Text>
                        </View>

                        <View style={style.inputGroup}>
                            <Text style={style.inputLabel}>Próxima Aplicação (opcional)</Text>
                            <TextInput
                                style={style.textInput}
                                placeholder="DD/MM/AAAA"
                                value={recordNextDate}
                                onChangeText={handleNextDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        <View style={style.inputGroup}>
                            <Text style={style.inputLabel}>Observações (opcional)</Text>
                            <TextInput
                                style={[style.textInput, style.textArea]}
                                placeholder="Notas adicionais..."
                                value={recordNotes}
                                onChangeText={setRecordNotes}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </ScrollView>

                    <View style={style.modalButtons}>
                        <TouchableOpacity 
                            style={[style.modalButton, style.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={style.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[style.modalButton, style.confirmButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={style.confirmButtonText}>
                                {mode === 'add' ? 'Adicionar' : 'Salvar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { style } from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { petService } from "../../services/petService";
import { API_URL } from "../../lib/api";
import { FormField } from "../../components/FormField";

const animalTypes = [
  { label: "Cão", value: "dog", image: require("../../assets/pets/dog.png") },
  { label: "Gato", value: "cat", image: require("../../assets/pets/cat.png") },
  { label: "Roedores", value: "Roedores", image: require("../../assets/pets/hamster.png") },
  { label: "Pássaro", value: "bird", image: require("../../assets/pets/bird.png") },
];

export default function CadastrarPet({ route, navigation }: any) {
  const existingPet = route?.params?.pet;
  const [isEditing] = useState(!!existingPet);

  const [name, setName] = useState(existingPet?.name || '');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [age, setAge] = useState(existingPet?.age?.toString() || '');
  const [weight, setWeight] = useState(existingPet?.weight?.toString() || '');
  const [animalType, setAnimalType] = useState(existingPet?.animalType || 'dog');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const existingPhotoUrl = existingPet?.photoUrl
    ? `${API_URL}${existingPet.photoUrl}`
    : null;

  const previewSource = photoUri
    ? { uri: photoUri }
    : existingPhotoUrl
    ? { uri: existingPhotoUrl }
    : null;

  const pickImage = async () => {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Permissão negada',
          'Acesso à galeria foi bloqueado. Habilite nas configurações do celular.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      }
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
      });
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[ImagePicker] Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar uma foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Foto do Pet', 'Como deseja adicionar a foto?', [
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleRegisterPet = async () => {
    if (!name || !breed || !age || !weight) {
      return Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
    }
    try {
      await petService.criar({
        name,
        breed,
        age: parseInt(age),
        weight: parseFloat(weight.replace(',', '.')),
        animalType,
        photoUri: photoUri ?? undefined,
      });
      Alert.alert('Sucesso', `${name} foi cadastrado com sucesso!`);
      setName('');
      setBreed('');
      setAge('');
      setWeight('');
      setAnimalType('dog');
      setPhotoUri(null);
    } catch (error) {
      console.error("Erro ao cadastrar pet:", error);
      Alert.alert('Erro', 'Não foi possível cadastrar o pet.');
    }
  };

  const handleUpdatePet = async () => {
    if (!existingPet) return;
    try {
      await petService.atualizar(existingPet.id, {
        name,
        breed,
        age: parseInt(age),
        weight: parseFloat(weight.replace(',', '.')),
        animalType,
        photoUri: photoUri ?? undefined,
      });
      Alert.alert("Sucesso", `${name} foi atualizado com sucesso!`);
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar pet:", error);
      Alert.alert("Erro", "Não foi possível atualizar o pet.");
    }
  };

  return (
    <View style={style.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={style.sectionTitle}>{isEditing ? 'Editar Pet' : 'Cadastrar Pet'}</Text>

        <View style={style.formContainer}>

          {/* Foto do pet */}
          <View style={style.inputGroup}>
            <Text style={style.inputLabel}>Foto do Pet</Text>
            <TouchableOpacity style={style.photoPickerButton} onPress={handlePickPhoto} activeOpacity={0.8}>
              {previewSource && (
                <Image source={previewSource} style={style.petPhotoPreview} />
              )}
              <MaterialIcons
                name={previewSource ? "edit" : "add-a-photo"}
                size={30}
                color={previewSource ? "#fff" : "#aaa"}
              />
              <Text style={style.photoPickerText}>
                {previewSource ? 'Trocar foto' : 'Toque para adicionar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tipo de animal */}
          <View style={style.inputGroup}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 20 }}
            >
              {animalTypes.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setAnimalType(item.value)}
                  activeOpacity={0.8}
                  style={{ alignItems: "center", opacity: animalType === item.value ? 1 : 0.6 }}
                >
                  <View
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      backgroundColor: animalType === item.value ? themes.colors.secundary : "#ddd",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                      borderWidth: 2,
                      borderColor: animalType === item.value ? themes.colors.corTexto : "transparent",
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Image source={item.image} style={{ width: 100, height: 100, resizeMode: "contain", borderRadius: 50 }} />
                  </View>
                  <Text style={{ color: themes.telaPets.petName, fontFamily: 'Baloo2_700Bold' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FormField
            label="Nome do Pet"
            placeholder="Ex: Totó"
            value={name}
            onChangeText={setName}
          />

          <FormField
            label="Raça"
            placeholder="Ex: Labrador, Vira-Lata"
            value={breed}
            onChangeText={setBreed}
          />

          <View style={style.dateTimeContainer}>
            <View style={style.halfInput}>
              <FormField
                label="Idade (anos)"
                placeholder="Ex: 5"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View style={style.halfInput}>
              <FormField
                label="Peso (Kg)"
                placeholder="Ex: 15.5"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={style.button}
            onPress={isEditing ? handleUpdatePet : handleRegisterPet}
          >
            <Text style={style.buttonText}>{isEditing ? "Salvar Alterações" : "Cadastrar Pet"}</Text>
            <MaterialIcons
              name={isEditing ? "save" : "pets"}
              size={24}
              color="#fff"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

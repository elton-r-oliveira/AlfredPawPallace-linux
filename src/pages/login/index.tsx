import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from "react-native";

import { style } from "./styles";
import Logo from "../../assets/logo.png";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { Input } from "../../components/input";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../@types/types";

import BiometricAuth from "./biometricAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

type Props = {
    navigation: LoginScreenNavigationProp;
};

export default function Login({ navigation }: Props) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [savedEmail, setSavedEmail] = useState("");

    useEffect(() => {
        checkBiometricAvailability();
        checkSavedCredentials();
    }, []);

    async function checkBiometricAvailability() {
        const { available } = await BiometricAuth.isBiometricAvailable();
        setBiometricAvailable(available);
    }

    async function checkSavedCredentials() {
        try {
            const storedEmail = await AsyncStorage.getItem("@saved_email");
            if (storedEmail) {
                setSavedEmail(storedEmail);
                setEmail(storedEmail);
            }
        } catch (error) {
            console.log("Erro ao buscar credenciais salvas:", error);
        }
    }

    async function handleBiometricLogin() {
        try {
            setLoading(true);

            const isAuthenticated = await BiometricAuth.authenticate();

            if (isAuthenticated && savedEmail) {
                const savedPassword = await AsyncStorage.getItem("@saved_password");

                if (savedPassword) {
                    await login(savedEmail, savedPassword);
                    navigation.replace("Home");
                } else {
                    Alert.alert("Erro", "Credenciais não encontradas. Faça login manualmente.");
                }
            } else {
                Alert.alert("Autenticação falhou", "Tente novamente ou use login manual");
            }
        } catch (error: any) {
            console.log("Erro no login biométrico:", error);
            const msg = error.response?.data?.message || "Falha na autenticação biométrica";
            Alert.alert("Erro", msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin() {
        try {
            setLoading(true);

            if (!email || !password) {
                setLoading(false);
                return Alert.alert("Atenção", "Informe o e-mail e a senha!");
            }

            await login(email, password);

            if (biometricAvailable) {
                try {
                    await AsyncStorage.setItem("@saved_email", email);
                    await AsyncStorage.setItem("@saved_password", password);
                } catch (storageError) {
                    console.log("Erro ao salvar credenciais:", storageError);
                }
            }

            navigation.replace("Home");

        } catch (error: any) {
            console.log("Erro no login:", error);

            let errorMessage = "Ocorreu um erro ao fazer login.";
            const status = error.response?.status;
            if (status === 401 || status === 400) {
                errorMessage = "E-mail ou senha incorretos.";
            } else if (status === 404) {
                errorMessage = "Usuário não encontrado.";
            } else if (error.message === "Network Error") {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert("Erro", errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const getBiometricButtonText = () => {
        if (Platform.OS === 'ios') return 'Entrar com Touch ID';
        return 'Entrar com Biometria';
    };

    return (
        <View style={style.container}>
            <View style={style.boxTop}>
                <Image source={Logo} style={style.logo} />
                <Text style={style.titulo}>Cuidando do seu melhor amigo</Text>
            </View>

            <View style={style.boxMid}>
                <Text style={style.entrar}>Entrar</Text>

                <Input
                    placeholder="E-mail"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    IconRight={MaterialIcons}
                    IconRightName="email"
                />

                <Input
                    placeholder="Senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    IconRight={Octicons}
                    IconRightName="eye-closed"
                />

                <TouchableOpacity
                    style={style.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={themes.colors.lightGray} size={"small"} />
                    ) : (
                        <Text style={style.textButton}>Entrar</Text>
                    )}
                </TouchableOpacity>

                {biometricAvailable && savedEmail && (
                    <TouchableOpacity
                        style={[style.button, style.biometricButton]}
                        onPress={handleBiometricLogin}
                        disabled={loading}
                    >
                        <MaterialIcons name="fingerprint" size={24} color={themes.colors.lightGray} />
                        <Text style={style.textButton}>{getBiometricButtonText()}</Text>
                    </TouchableOpacity>
                )}

                <Text style={style.textCadastro}>
                    Não tem conta?{" "}
                    <Text
                        style={style.linkCadastro}
                        onPress={() => navigation.navigate("Cadastro")}
                    >
                        Criar uma conta
                    </Text>
                </Text>
            </View>
        </View>
    );
}

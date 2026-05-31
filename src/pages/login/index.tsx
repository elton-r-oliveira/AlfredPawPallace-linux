// Login.tsx
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

// 🔹 Import Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";

import BiometricAuth from "./biometricAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Login"
>;

type Props = {
    navigation: LoginScreenNavigationProp;
};

export default function Login({ navigation }: Props) {
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
                setEmail(storedEmail); // ✅ Preenche o campo email automaticamente
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
                // Buscar a senha salva
                const savedPassword = await AsyncStorage.getItem("@saved_password");
                
                if (savedPassword) {
                    // Fazer login automaticamente
                    await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
                    navigation.replace("Home");
                } else {
                    Alert.alert("Erro", "Credenciais não encontradas. Faça login manualmente.");
                }
            } else {
                Alert.alert("Autenticação falhou", "Tente novamente ou use login manual");
            }
        } catch (error: any) {
            console.log("Erro no login biométrico:", error);
            
            // Tratamento de erros específicos do Firebase
            let errorMessage = "Falha na autenticação biométrica";
            if (error.code === 'auth/invalid-email') {
                errorMessage = "E-mail salvo é inválido";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Credenciais salvas estão incorretas";
            }
            
            Alert.alert("Erro", errorMessage);
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

            await signInWithEmailAndPassword(auth, email, password);

            // Salvar credenciais para biometria (apenas se o usuário fez login com sucesso)
            if (biometricAvailable) {
                try {
                    await AsyncStorage.setItem("@saved_email", email);
                    await AsyncStorage.setItem("@saved_password", password);
                    console.log("Credenciais salvas para biometria");
                } catch (storageError) {
                    console.log("Erro ao salvar credenciais:", storageError);
                }
            }

            navigation.replace("Home");

        } catch (error: any) {
            console.log("Erro no login:", error.message);
            
            // Tratamento de erros específicos do Firebase
            let errorMessage = "Ocorreu um erro ao fazer login.";
            if (error.code === 'auth/invalid-email') {
                errorMessage = "O e-mail informado é inválido.";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "E-mail ou senha incorretos.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Erro de conexão. Verifique sua internet.";
            }
            
            Alert.alert("Erro", errorMessage);

        } finally {
            setLoading(false);
        }
    }

    // ✅ Função para determinar o texto do botão de biometria
    const getBiometricButtonText = () => {
        if (Platform.OS === 'ios') {
            return 'Entrar com Touch ID';
        } else {
            return 'Entrar com Biometria';
        }
    };

    return (
        <View style={style.container}>
            <View style={style.boxTop}>
                <Image source={Logo} style={style.logo} />
                <Text style={style.titulo}>Cuidando do seu melhor amigo</Text>
            </View>

            <View style={style.boxMid}>
                <Text style={style.entrar}>Entrar</Text>

                {/* Input de e-mail */}
                <Input
                    placeholder="E-mail"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    IconRight={MaterialIcons}
                    IconRightName="email"
                />

                {/* Input de senha */}
                <Input
                    placeholder="Senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    IconRight={Octicons}
                    IconRightName="eye-closed"
                />

                {/* Botão de entrar normal */}
                <TouchableOpacity 
                    style={style.button} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator 
                            color={themes.colors.lightGray} 
                            size={"small"} 
                        />
                    ) : (
                        <Text style={style.textButton}>Entrar</Text>
                    )}
                </TouchableOpacity>

                {/* Botão de biometria (aparece apenas se disponível) */}
                {biometricAvailable && savedEmail && (
                    <TouchableOpacity 
                        style={[style.button, style.biometricButton]}
                        onPress={handleBiometricLogin}
                        disabled={loading}
                    >
                        <MaterialIcons 
                            name="fingerprint" 
                            size={24} 
                            color={themes.colors.lightGray} 
                        />
                        <Text style={style.textButton}>
                            {getBiometricButtonText()}
                        </Text>
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
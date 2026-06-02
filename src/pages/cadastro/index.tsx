import React, { useState } from "react";
import { Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";

import { style } from "./styles";
import Logo from "../../assets/logo.png";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { themes } from "../../global/themes";
import { Input } from "../../components/input";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../@types/types";
import { authService } from "../../services/authService";

type CadastroScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Cadastro">;

type Props = {
  navigation: CadastroScreenNavigationProp;
};

export default function Cadastro({ navigation }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<"cliente" | "funcionario">("cliente");
  const [codigoFuncionario, setCodigoFuncionario] = useState("");

  async function handleCadastro() {
    try {
      setLoading(true);

      if (!nome || !email || !password || !confirmPassword) {
        setLoading(false);
        return Alert.alert("Atenção", "Preencha todos os campos!");
      }

      if (password !== confirmPassword) {
        setLoading(false);
        return Alert.alert("Atenção", "As senhas não coincidem!");
      }

      await authService.register(nome, email, password, tipo, codigoFuncionario || undefined);

      Alert.alert("Conta criada com sucesso!");
      navigation.navigate("Login");
    } catch (error: any) {
      console.log("Erro no cadastro:", error);

      let errorMessage = "Ocorreu um erro ao criar a conta.";
      const status = error.response?.status;
      if (status === 409) {
        errorMessage = "Este e-mail já está em uso.";
      } else if (status === 400) {
        errorMessage = error.response?.data?.message || "Dados inválidos.";
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

  return (
    <View style={style.container}>
      <View style={style.boxTop}>
        <Image source={Logo} style={style.logo} />
      </View>

      <View style={style.boxMid}>
        <View style={style.toggle}>
          <TouchableOpacity
            style={[style.toggleOption, tipo === "cliente" && style.toggleActive]}
            onPress={() => setTipo("cliente")}
          >
            <Text style={[style.toggleText, tipo === "cliente" && style.toggleTextActive]}>
              Cliente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[style.toggleOption, tipo === "funcionario" && style.toggleActive]}
            onPress={() => setTipo("funcionario")}
          >
            <Text style={[style.toggleText, tipo === "funcionario" && style.toggleTextActive]}>
              Funcionário
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={style.entrar}>Cadastre-se</Text>

        {tipo === "funcionario" ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
                IconRight={MaterialIcons}
                IconRightName="person"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Código de funcionário"
                value={codigoFuncionario}
                onChangeText={setCodigoFuncionario}
                IconRight={MaterialIcons}
                IconRightName="badge"
              />
            </View>
          </View>
        ) : (
          <Input
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            IconRight={MaterialIcons}
            IconRightName="person"
          />
        )}

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

        <Input
          placeholder="Confirmar senha"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          IconRight={Octicons}
          IconRightName="eye-closed"
        />

        <TouchableOpacity style={style.button} onPress={handleCadastro}>
          {loading ? (
            <ActivityIndicator color={themes.colors.lightGray} size="small" />
          ) : (
            <Text style={style.textButton}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <Text style={style.textCadastro}>
          Já tem conta?{" "}
          <Text style={style.linkCadastro} onPress={() => navigation.navigate("Login")}>
            Fazer login
          </Text>
        </Text>
      </View>
    </View>
  );
}

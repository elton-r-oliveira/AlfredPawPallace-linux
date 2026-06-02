import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { style } from "./styles";
import { themes } from "../../global/themes";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../@types/types";
import { MaterialIcons, Ionicons, Fontisto } from "@expo/vector-icons";
import EnderecoInput from "../../components/EnderecoInput";

import { useAuth } from "../../contexts/AuthContext";
import { usuarioService } from "../../services/usuarioService";
import { FormField } from "../../components/FormField";

type PerfilScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Perfil">;

export default function Perfil() {
  const navigation = useNavigation<PerfilScreenNavigationProp>();
  const { usuario, logout, atualizarUsuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [rua, setRua] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numero, setNumero] = useState("");
  const [cep, setCep] = useState("");

  const [originalData, setOriginalData] = useState({
    nome: "", telefone: "", endereco: "", cep: "", rua: "", cidade: "", estado: "", numero: "",
  });

  const originalDataRef = useRef(originalData);
  const editingRef = useRef(editing);
  const logoutInProgressRef = useRef(logoutInProgress);
  const isDirtyRef = useRef(false);
  const alertShownRef = useRef(false);

  useEffect(() => { originalDataRef.current = originalData; }, [originalData]);
  useEffect(() => { editingRef.current = editing; }, [editing]);
  useEffect(() => { logoutInProgressRef.current = logoutInProgress; }, [logoutInProgress]);

  const checkIsDirty = () => {
    const dirty = nome !== originalData.nome ||
      telefone !== originalData.telefone ||
      cep !== originalData.cep ||
      rua !== originalData.rua ||
      cidade !== originalData.cidade ||
      estado !== originalData.estado ||
      numero !== originalData.numero;
    isDirtyRef.current = dirty;
    return dirty;
  };

  useEffect(() => { checkIsDirty(); }, [nome, telefone, cep, rua, cidade, estado, numero, originalData]);

  async function carregarDadosExtras() {
    if (!usuario) return;
    try {
      const data = await usuarioService.buscar(usuario.id);
      setNome(data.nome || usuario.nome);
      setEmail(data.email);
      setTelefone(data.telefone || "");
      setEndereco(data.endereco || "");
      setCep(data.cep || "");
      setRua(data.rua || "");
      setCidade(data.cidade || "");
      setEstado(data.estado || "");
      setNumero(data.numero || "");

      const orig = {
        nome: data.nome || usuario.nome,
        telefone: data.telefone || "",
        endereco: data.endereco || "",
        cep: data.cep || "",
        rua: data.rua || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        numero: data.numero || "",
      };
      setOriginalData(orig);
    } catch (error) {
      console.error("Erro ao carregar dados do perfil:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email);
      setNome(usuario.nome);
      carregarDadosExtras();
    } else {
      setLoading(false);
    }
  }, []);

  const resetarCamposParaOriginais = () => {
    const orig = originalDataRef.current;
    setNome(orig.nome ?? "");
    setTelefone(orig.telefone ?? "");
    setEndereco(orig.endereco ?? "");
    setCep(orig.cep ?? "");
    setRua(orig.rua ?? "");
    setCidade(orig.cidade ?? "");
    setEstado(orig.estado ?? "");
    setNumero(orig.numero ?? "");
    setEditing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      alertShownRef.current = false;
      let active = true;
      if (!editingRef.current && usuario && active) {
        carregarDadosExtras();
      }
      return () => {
        active = false;
        if (editingRef.current && isDirtyRef.current && !logoutInProgressRef.current && !alertShownRef.current) {
          alertShownRef.current = true;
          Alert.alert(
            "Alterações não salvas",
            "Suas alterações não foram salvas e serão descartadas.",
            [
              { text: "Continuar editando", style: "cancel", onPress: () => { navigation.navigate("Perfil"); alertShownRef.current = false; } },
              { text: "Descartar e sair", style: "destructive", onPress: () => { resetarCamposParaOriginais(); alertShownRef.current = false; } },
            ]
          );
        }
      };
    }, [navigation, usuario])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (editingRef.current && isDirtyRef.current && !logoutInProgressRef.current && !alertShownRef.current) {
        e.preventDefault();
        alertShownRef.current = true;
        Alert.alert(
          "Alterações não salvas",
          "Suas alterações não foram salvas e serão descartadas.",
          [
            { text: "Continuar editando", style: "cancel", onPress: () => { alertShownRef.current = false; } },
            { text: "Descartar e sair", style: "destructive", onPress: () => { resetarCamposParaOriginais(); navigation.dispatch(e.data.action); alertShownRef.current = false; } },
          ]
        );
      }
    });
    return unsubscribe;
  }, [navigation]);

  async function salvarAlteracoes() {
    if (!usuario) return;
    try {
      setLoading(true);
      const enderecoFormatado = `${rua}, ${numero} - ${cidade}/${estado}`;
      const atualizado = await usuarioService.atualizar(usuario.id, {
        nome, telefone, endereco: enderecoFormatado, cep, rua, cidade, estado, numero,
      });

      setEndereco(enderecoFormatado);
      atualizarUsuario({ nome: atualizado.nome, endereco: enderecoFormatado });

      setOriginalData({ nome, telefone, endereco: enderecoFormatado, cep, rua, cidade, estado, numero });
      Alert.alert("Sucesso", "Informações atualizadas com sucesso!");
      setEditing(false);
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  }

  function handleEditPress() { setEditing(true); }
  function cancelarEdicao() { resetarCamposParaOriginais(); }

  async function handleLogout() {
    if (editing && checkIsDirty()) {
      Alert.alert(
        "Alterações não salvas",
        "Você tem alterações não salvas. Deseja salvar antes de sair?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair mesmo assim", style: "destructive", onPress: () => { resetarCamposParaOriginais(); alertShownRef.current = false; confirmarLogout(); } },
          { text: "Salvar e sair", onPress: async () => { await salvarAlteracoes(); confirmarLogout(); } },
        ]
      );
    } else {
      confirmarLogout();
    }
  }

  function confirmarLogout() {
    Alert.alert(
      "Confirmar Logout",
      "Tem certeza que deseja sair da conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: executarLogout },
      ]
    );
  }

  async function executarLogout() {
    setLogoutInProgress(true);
    try {
      await logout();
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
    } catch (error) {
      Alert.alert("Erro", "Falha ao sair da conta.");
    } finally {
      setLogoutInProgress(false);
    }
  }

  if (loading) {
    return (
      <View style={[style.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={themes.colors.corTexto} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={style.container} showsVerticalScrollIndicator={false}>
        <Text style={style.sectionTitle}>Informações do Perfil</Text>

        <View style={{ margin: 20 }}>
          <FormField
            label="Nome"
            icon={<Ionicons name="person-outline" size={20} color={themes.colors.secundary} />}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            editable={editing}
          />

          <FormField
            label="E-mail"
            icon={<Fontisto name="email" size={20} color={themes.colors.secundary} />}
            value={email}
            editable={false}
          />

          <FormField
            label="Telefone"
            icon={<Ionicons name="call-outline" size={20} color={themes.colors.secundary} />}
            value={telefone}
            onChangeText={setTelefone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            editable={editing}
          />

          <View style={style.inputGroup}>
            <EnderecoInput
              cep={cep}
              setCep={setCep}
              rua={rua}
              setRua={setRua}
              cidade={cidade}
              setCidade={setCidade}
              estado={estado}
              setEstado={setEstado}
              numero={numero}
              setNumero={setNumero}
              editable={editing}
            />
          </View>
        </View>

        <View style={{ marginTop: 5, gap: 10, margin: 20 }}>
          {editing ? (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <TouchableOpacity
                  style={[style.buttonSave, { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
                  onPress={salvarAlteracoes}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <MaterialIcons name="save" size={20} color="#FFF" />
                      <Text style={style.textButton}>Salvar</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[style.buttonEdit, { flex: 1, backgroundColor: themes.colors.bgScreen, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
                  onPress={cancelarEdicao}
                >
                  <MaterialIcons name="cancel" size={20} color="#FFF" />
                  <Text style={style.textButton}>Cancelar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[style.buttonLogout, { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
                onPress={handleLogout}
                disabled={logoutInProgress}
              >
                {logoutInProgress ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialIcons name="logout" size={20} color="#FFF" />
                    <Text style={style.textButton}>Logout</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[style.buttonEdit, { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
                onPress={handleEditPress}
              >
                <MaterialIcons name="edit" size={20} color="#FFF" />
                <Text style={style.textButton}>Editar Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[style.buttonLogout, { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
                onPress={handleLogout}
                disabled={logoutInProgress}
              >
                {logoutInProgress ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialIcons name="logout" size={20} color="#FFF" />
                    <Text style={style.textButton}>Logout</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

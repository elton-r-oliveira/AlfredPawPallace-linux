import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import { RootStackParamList } from "./@types/types";
import BottomBar from "./components/bottomBar";
import Pets from "./pages/Pets";
import CadastrarPet from "./pages/CadastrarPet";
import Saude from "./pages/Saude";
import { useAuth } from "./contexts/AuthContext";
import { themes } from "./global/themes";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: themes.telaHome.fundo }}>
        <ActivityIndicator size="large" color={themes.colors.secundary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={usuario ? "Home" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} options={{ animation: "slide_from_left" }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="Home" component={BottomBar} options={{ animation: "fade" }} />
        <Stack.Screen name="MeusPets" component={Pets} options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="Saude" component={Saude} options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="CadastrarPet" component={CadastrarPet} options={{ animation: "slide_from_right" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

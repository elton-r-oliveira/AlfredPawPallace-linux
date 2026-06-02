import { StyleSheet } from "react-native";
import { themes } from "../../global/themes";

export const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: themes.login_cadastro.fundo,
    },

    boxTop: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },

    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
    },

    boxMid: {
        width: "100%",
        backgroundColor: themes.login_cadastro.fundoBox,
        padding: 20,
        borderRadius: 30,
        alignSelf: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },

    entrar: {
        fontSize: 25,
        marginBottom: 10,
        textAlign: "center",
        color: themes.login_cadastro.titulo,
        fontFamily: "Inter_600SemiBold",
    },

    button: {
        marginTop: 30,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 50,
        backgroundColor: themes.login_cadastro.titulo,
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },

    textButton: {
        color: themes.login_cadastro.fundoBox,
        fontFamily: "Inter_600SemiBold",
        fontSize: 15,
    },

    textCadastro: {
        marginTop: 25,
        textAlign: "center",
        color: themes.login_cadastro.titulo,
        fontSize: 15,
        fontFamily: "Baloo2_400Regular",
    },

    linkCadastro: {
        fontSize: 15,
        fontFamily: "Baloo2_800ExtraBold",
    },

    titulo: {
        fontSize: 15,
        marginTop: 10,
        color: themes.login_cadastro.titulo,
        fontFamily: "Inter_600SemiBold",
    },

    toggle: {
        flexDirection: "row",
        borderRadius: 25,
        overflow: "hidden",
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },

    toggleOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: "#ddd",
    },

    toggleActive: {
        backgroundColor: themes.colors.secundary,
    },

    toggleText: {
        fontWeight: "600",
        color: "#555",
        fontFamily: "Inter_600SemiBold",
    },

    toggleTextActive: {
        color: "#fff",
    },
});

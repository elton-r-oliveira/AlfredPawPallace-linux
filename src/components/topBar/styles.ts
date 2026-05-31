import { StyleSheet } from "react-native";
import { themes } from "../../global/themes";

export const style = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: themes.colors.lightGray,
    borderRadius: 25,
    elevation: 15,
    shadowColor: themes.colors.iconeQuickAcess1,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
    alignItems: "flex-start",
  },
  hello: {
    fontSize: 14,
    color: themes.colors.bgScreen,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: themes.colors.bgScreen,
  },
  location: {
    fontSize: 12,
    color: themes.colors.bgScreen,
  },
  petnName: {
    fontSize: 12,
    color: themes.colors.bgScreen,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: themes.colors.lightGray,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
  },
  
  // 🔴 Badge de urgência (exclamação laranja)
  urgentBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#FF9800",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: themes.colors.lightGray,
  },
  urgentBadgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  
  // 🔵 Badge normal (número azul)
  normalBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: themes.colors.lightGray,
  },
  normalBadgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 10,
  },

  // ESTILOS DO MODAL DA LOGO (mantidos)
  userModalContent: {
    width: "90%",
    backgroundColor: themes.colors.corTexto,
    padding: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 50,
    position: 'absolute',
  },
  titleModal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: themes.colors.bgScreen,
    borderBottomWidth: 1,
    borderBottomColor: themes.colors.corTexto,
    paddingBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themes.colors.corTexto,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: themes.colors.bgScreen,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
});
export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  editarUsuario: undefined;
  MeusPets: undefined;
  CadastrarPet: undefined;
  Perfil: undefined;
  Saude: undefined;
} & BottomTabParamList;

export type BottomTabParamList = {
  Home: undefined;
  Agendar: { categoria?: string; servico?: string };
  Saúde: { tela?: 'vacinas' | 'consultas' | 'produtos' };
  Pets: undefined;
  Perfil: undefined;
};
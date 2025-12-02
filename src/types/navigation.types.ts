export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  // Adicione suas outras rotas aqui
};

export type RoutePermissions = {
  [key in keyof RootStackParamList]?: string[];
};

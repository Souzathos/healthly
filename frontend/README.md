# Healthly — App (React Native / Expo)

Frontend mobile da rede social de dietas **Healthly**, feito com **Expo + React Navigation + NativeWind (Tailwind)** em **JavaScript (JS/JSX)**, consumindo o backend em `../backend`.

## Rodando

```bash
cd frontend
npm install
npx expo start
```

Abra no **Expo Go** (iOS/Android) ou em um emulador (`npm run android` / `npm run ios`).

## Apontar para o backend

A URL base fica em [src/services/api.js](src/services/api.js):

- **Emulador Android:** `http://10.0.2.2:3000` (já é o padrão no Android)
- **iOS simulator / web:** `http://localhost:3000`
- **Device físico (Expo Go):** defina a variável `EXPO_PUBLIC_API_URL=http://<IP-da-sua-maquina>:3000` (ex.: num arquivo `.env`) ou ajuste o fallback no próprio `api.js`.

Suba o backend antes: na pasta `../backend`, `npm run dev` (precisa de MySQL — veja `docker-compose.yml`).

## O que está funcional (ponta a ponta, com API real)

- **Autenticação:** login e cadastro (wizard de 3 passos), token JWT persistido com AsyncStorage.
- **CRUD de usuário:** ver perfil (`/user/me`), editar perfil (nome, @usuário, bio, objetivo, senha) e **excluir conta**.
- **Posts:** criar post com texto + imagens (`expo-image-picker`), feed (`/post/feed`) e detalhe do post.

## Apenas visual / mock (fora do escopo desta entrega)

Stories, aba "Seguindo", busca, notificações, mensagens e as interações de curtir/repostar/comentar
(estado local, sem persistir).

## Estrutura

```
src/
  services/     # api.js (cliente fetch central) + funções por recurso (auth, users, posts)
  context/      # AuthContext (sessão + persistência)
  navigation/   # RootNavigator, AuthStack, AppTabs, BottomTabBar
  components/   # Avatar, Button, Input, Icon, PostCard, StoryRow, Logo...
  pages/        # Splash, Login, Signup, Home, Create, Profile, EditProfile, PostDetail, Search, Notifications (.jsx)
  theme/        # cores do design system
  utils/        # formatação (datas, contagens, iniciais)
```

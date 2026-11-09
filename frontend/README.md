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
- **Posts:** criar post com texto + imagens (`expo-image-picker`), detalhe e exclusão do próprio post.
- **Feed:** abas "Para você" (`/post/explore`, posts de todo mundo) e "Seguindo" (`/post/feed`), com scroll infinito.
- **Interações:** curtir e salvar posts; comentar, curtir e excluir comentários.
- **Pessoas:** busca por nome ou @usuário (`/user/search`) e seguir/deixar de seguir na busca e no perfil.
- **Perfil:** abas Posts / Curtidas / Salvos.
- **Sessão:** token expirado ou inválido leva de volta ao login.
- **Tempo real (socket.io):** notificações de curtida, comentário, repost e novo seguidor, com contador no sino.
- **Mensagens diretas:** lista de conversas e chat ao vivo, com contador de não lidas. Botão "Mensagem" no perfil.
- **Profissionais verificados:** nutricionista ou educador físico envia o CRN/CREF, o admin aprova e o selo aparece.
- **Descoberta:** hashtags clicáveis, busca de posts, filtro por dieta e hashtags em alta.
- **Repostar** e feed "Para você" ordenado por relevância (interações e idade do post).

## Contas de demonstração (`npm run seed` no backend)

Senha de todas: `senha123`. `ana@healthly.dev`, `bruno@healthly.dev`, `carla@healthly.dev` (nutricionista verificada)
e `admin@healthly.dev`, que vê "Pedidos de verificação" no próprio perfil.

## Ainda não implementado

Stories, acompanhamento de progresso e preferências de alertas. O app mostra só dados reais.

## Estrutura

```
src/
  services/     # api.js (cliente fetch central) + funções por recurso (auth, users, posts)
  context/      # AuthContext (sessão + persistência)
  navigation/   # RootNavigator, AuthStack, AppTabs, BottomTabBar
  components/   # Avatar, Button, Input, Icon, IconButton, ScreenHeader, TabStrip, PostActions, EmptyState, ConfirmDialog...
  components/ui/ # Componentes adaptados do React Native Reusables
  pages/        # Splash, Login, Signup, Home, Create, Profile, EditProfile, PostDetail, Search, Notifications (.jsx)
  theme/        # tokens.js: cores e tamanhos de ícone (fonte única, também lida pelo Tailwind)
  utils/        # formatação (datas, contagens, iniciais)
```

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent chama AppRegistry.registerComponent('main', () => App);
// Garante que o app funcione tanto no Expo Go quanto em build nativa.
registerRootComponent(App);

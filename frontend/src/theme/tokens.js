// Fonte única do design system. Em CommonJS porque o tailwind.config.js também lê este arquivo.
const colors = {
  accent: "#c8f53a",
  accent2: "#5af5a0",
  accentSoft: "rgba(200,245,58,0.12)",
  dark: "#080808",
  surface: "#111111",
  surface2: "#181818",
  line: "#222222",
  divider: "#1a1a1a",
  inputBorder: "#2a2a2a",
  faint: "#333333",
  muted: "#888888",
  mutedDark: "#555555",
  soft: "#e0e0e0",
  text: "#ffffff",
  danger: "#e05c5c",
};

// Paleta dos avatares gerados a partir do nome
const avatarColors = ["#e05c5c", "#5c8be0", "#c8f53a", "#f5a83a", "#a83af5", "#5af5a0"];

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 40,
};

module.exports = { colors, avatarColors, iconSizes };

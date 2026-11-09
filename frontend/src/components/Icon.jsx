import React from "react";
import Svg, { Path, Circle, Rect, Polyline, Polygon, Line } from "react-native-svg";
import { colors, iconSizes } from "../theme/colors";

// size: "sm" | "md" | "lg" | "xl" (veja theme/tokens.js)
export const Icon = ({ name, size = "lg", color = colors.text, strokeWidth = 1.8 }) => {
  const pixels = iconSizes[size] ?? size;
  const common = {
    width: pixels,
    height: pixels,
    viewBox: "0 0 24 24",
  };
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "home":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <Polyline {...stroke} points="9 22 9 12 15 12 15 22" />
        </Svg>
      );
    case "search":
      return (
        <Svg {...common}>
          <Circle {...stroke} cx="11" cy="11" r="8" />
          <Path {...stroke} d="m21 21-4.35-4.35" />
        </Svg>
      );
    case "bell":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path {...stroke} d="M13.73 21a2 2 0 01-3.46 0" />
        </Svg>
      );
    case "user":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <Circle {...stroke} cx="12" cy="7" r="4" />
        </Svg>
      );
    case "plus":
      return (
        <Svg {...common}>
          <Path {...stroke} strokeWidth={2.5} d="M12 5v14M5 12h14" />
        </Svg>
      );
    case "heart":
      return (
        <Svg {...common}>
          <Path
            {...stroke}
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          />
        </Svg>
      );
    case "heartFill":
      return (
        <Svg {...common}>
          <Path
            fill={color}
            stroke={color}
            strokeWidth={strokeWidth}
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          />
        </Svg>
      );
    case "comment":
      return (
        <Svg {...common}>
          <Path
            {...stroke}
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          />
        </Svg>
      );
    case "back":
      return (
        <Svg {...common}>
          <Polyline {...stroke} points="15 18 9 12 15 6" />
        </Svg>
      );
    case "image":
      return (
        <Svg {...common}>
          <Rect {...stroke} x="3" y="3" width="18" height="18" rx="2" />
          <Circle {...stroke} cx="8.5" cy="8.5" r="1.5" />
          <Polyline {...stroke} points="21 15 16 10 5 21" />
        </Svg>
      );
    case "check":
      return (
        <Svg {...common}>
          <Polyline {...stroke} strokeWidth={2.5} points="20 6 9 17 4 12" />
        </Svg>
      );
    case "x":
      return (
        <Svg {...common}>
          <Line {...stroke} strokeWidth={2.5} x1="18" y1="6" x2="6" y2="18" />
          <Line {...stroke} strokeWidth={2.5} x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    case "eye":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle {...stroke} cx="12" cy="12" r="3" />
        </Svg>
      );
    case "eyeOff":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <Line {...stroke} x1="1" y1="1" x2="23" y2="23" />
        </Svg>
      );
    case "mail":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <Polyline {...stroke} points="22,6 12,13 2,6" />
        </Svg>
      );
    case "repeat":
      return (
        <Svg {...common}>
          <Polyline {...stroke} points="17 1 21 5 17 9" />
          <Path {...stroke} d="M3 11V9a4 4 0 014-4h14" />
          <Polyline {...stroke} points="7 23 3 19 7 15" />
          <Path {...stroke} d="M21 13v2a4 4 0 01-4 4H3" />
        </Svg>
      );
    case "grid":
      return (
        <Svg {...common}>
          <Rect {...stroke} x="3" y="3" width="7" height="7" />
          <Rect {...stroke} x="14" y="3" width="7" height="7" />
          <Rect {...stroke} x="3" y="14" width="7" height="7" />
          <Rect {...stroke} x="14" y="14" width="7" height="7" />
        </Svg>
      );
    case "bookmark":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </Svg>
      );
    case "bookmarkFill":
      return (
        <Svg {...common}>
          <Path {...stroke} fill={color} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </Svg>
      );
    case "send":
      return (
        <Svg {...common}>
          <Line {...stroke} x1="22" y1="2" x2="11" y2="13" />
          <Polygon {...stroke} points="22 2 15 22 11 13 2 9 22 2" />
        </Svg>
      );
    case "trash":
      return (
        <Svg {...common}>
          <Polyline {...stroke} points="3 6 5 6 21 6" />
          <Path
            {...stroke}
            d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
          />
        </Svg>
      );
    case "logout":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <Polyline {...stroke} points="16 17 21 12 16 7" />
          <Line {...stroke} x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );
    default:
      if (__DEV__) console.warn(`Icon: ícone "${name}" não existe`);
      return null;
  }
};

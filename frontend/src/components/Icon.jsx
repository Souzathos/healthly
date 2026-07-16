import React from "react";
import Svg, { Path, Circle, Rect, Polyline, Polygon, Line } from "react-native-svg";

export const Icon = ({ name, size = 24, color = "#ffffff", strokeWidth = 1.8 }) => {
  const common = {
    width: size,
    height: size,
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
    case "repeat":
      return (
        <Svg {...common}>
          <Polyline {...stroke} points="17 1 21 5 17 9" />
          <Path {...stroke} d="M3 11V9a4 4 0 014-4h14" />
          <Polyline {...stroke} points="7 23 3 19 7 15" />
          <Path {...stroke} d="M21 13v2a4 4 0 01-4 4H3" />
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
    case "chart":
      return (
        <Svg {...common}>
          <Polyline {...stroke} points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </Svg>
      );
    case "share":
      return (
        <Svg {...common}>
          <Circle {...stroke} cx="18" cy="5" r="3" />
          <Circle {...stroke} cx="6" cy="12" r="3" />
          <Circle {...stroke} cx="18" cy="19" r="3" />
          <Line {...stroke} x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <Line {...stroke} x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </Svg>
      );
    case "back":
      return (
        <Svg {...common}>
          <Polyline {...stroke} points="15 18 9 12 15 6" />
        </Svg>
      );
    case "more":
      return (
        <Svg {...common}>
          <Circle fill={color} cx="5" cy="12" r="1.5" />
          <Circle fill={color} cx="12" cy="12" r="1.5" />
          <Circle fill={color} cx="19" cy="12" r="1.5" />
        </Svg>
      );
    case "camera":
      return (
        <Svg {...common}>
          <Path
            {...stroke}
            d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
          />
          <Circle {...stroke} cx="12" cy="13" r="4" />
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
    case "mail":
      return (
        <Svg {...common}>
          <Path
            {...stroke}
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          />
          <Polyline {...stroke} points="22 6 12 13 2 6" />
        </Svg>
      );
    case "eye":
      return (
        <Svg {...common}>
          <Path {...stroke} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle {...stroke} cx="12" cy="12" r="3" />
        </Svg>
      );
    case "settings":
      return (
        <Svg {...common}>
          <Circle {...stroke} cx="12" cy="12" r="3" />
          <Path
            {...stroke}
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          />
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
      return null;
  }
};

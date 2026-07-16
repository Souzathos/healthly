import React from "react";
import Svg, { Path, Polyline } from "react-native-svg";

export const VerifiedBadge = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#c8f53a" d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <Polyline
      points="22 4 12 14.01 9 11.01"
      fill="none"
      stroke="#080808"
      strokeWidth={2}
    />
  </Svg>
);

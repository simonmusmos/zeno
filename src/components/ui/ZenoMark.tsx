import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme';

interface ZenoMarkProps {
  size?: number;
}

/**
 * Zeno owl mark — hairline outlines only.
 * No fill, no gradients. Just geometry.
 */
export function ZenoMark({ size = 44 }: ZenoMarkProps) {
  const s = size / 44;
  const gold = colors.accent;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 44 44">
        {/* Outer head ring */}
        <Circle cx="22" cy="24" r="16" fill="none" stroke={gold} strokeWidth="0.8" opacity={0.35} />

        {/* Ear tufts — two small arcs pointing up */}
        <Path
          d="M15 11 L13 6 L18 10"
          fill="none" stroke={gold} strokeWidth="0.9"
          strokeLinecap="round" strokeLinejoin="round"
          opacity={0.5}
        />
        <Path
          d="M29 11 L31 6 L26 10"
          fill="none" stroke={gold} strokeWidth="0.9"
          strokeLinecap="round" strokeLinejoin="round"
          opacity={0.5}
        />

        {/* Left eye — outer ring */}
        <Circle cx="17" cy="24" r="5.5" fill="none" stroke={gold} strokeWidth="0.8" opacity={0.6} />
        {/* Left iris dot */}
        <Circle cx="17" cy="24" r="1.8" fill={gold} opacity={0.5} />

        {/* Right eye — outer ring */}
        <Circle cx="27" cy="24" r="5.5" fill="none" stroke={gold} strokeWidth="0.8" opacity={0.6} />
        {/* Right iris dot */}
        <Circle cx="27" cy="24" r="1.8" fill={gold} opacity={0.5} />

        {/* Beak — small downward triangle */}
        <Path
          d="M22 29 L20 32 L24 32 Z"
          fill={gold} opacity={0.4}
        />

        {/* Bottom arc — chest/perch suggestion */}
        <Path
          d="M14 37 Q22 41 30 37"
          fill="none" stroke={gold} strokeWidth="0.7"
          opacity={0.2}
        />
      </Svg>
    </View>
  );
}

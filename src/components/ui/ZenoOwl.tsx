import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line, Polygon } from 'react-native-svg';
import { colors } from '../../theme';

interface ZenoOwlProps {
  size?: number;
}

/**
 * Zeno owl mark — geometric, minimal, brand-grade.
 * Precision geometry: every element on a strict grid.
 */
export function ZenoOwl({ size = 64 }: ZenoOwlProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {/* Outer ring — thin gold circle */}
        <Circle
          cx="32" cy="32" r="30"
          fill="none"
          stroke={colors.accent}
          strokeWidth="1"
          opacity={0.4}
        />

        {/* Head shape — filled dark circle slightly inset */}
        <Circle cx="32" cy="32" r="26" fill={colors.surface} />

        {/* Ear tufts — two sharp triangles */}
        <Polygon
          points="20,12 16,4 24,10"
          fill={colors.surface}
        />
        <Polygon
          points="44,12 48,4 40,10"
          fill={colors.surface}
        />
        {/* Tuft accent tips */}
        <Polygon
          points="20,12 17,5 22,9"
          fill={colors.accent}
          opacity={0.9}
        />
        <Polygon
          points="44,12 47,5 42,9"
          fill={colors.accent}
          opacity={0.9}
        />

        {/* Left eye — outer ring */}
        <Circle cx="24" cy="30" r="8" fill={colors.background} />
        <Circle cx="24" cy="30" r="7.5" fill="none" stroke={colors.accent} strokeWidth="1" opacity={0.7} />

        {/* Right eye — outer ring */}
        <Circle cx="40" cy="30" r="8" fill={colors.background} />
        <Circle cx="40" cy="30" r="7.5" fill="none" stroke={colors.accent} strokeWidth="1" opacity={0.7} />

        {/* Left iris */}
        <Circle cx="24" cy="30" r="4.5" fill={colors.primary} />
        {/* Right iris */}
        <Circle cx="40" cy="30" r="4.5" fill={colors.primary} />

        {/* Left pupil */}
        <Circle cx="24" cy="30" r="2.2" fill={colors.background} />
        {/* Right pupil */}
        <Circle cx="40" cy="30" r="2.2" fill={colors.background} />

        {/* Specular highlights */}
        <Circle cx="25.2" cy="28.8" r="0.9" fill={colors.textPrimary} opacity={0.5} />
        <Circle cx="41.2" cy="28.8" r="0.9" fill={colors.textPrimary} opacity={0.5} />

        {/* Beak — small diamond */}
        <Polygon
          points="32,36 29,39 32,42 35,39"
          fill={colors.accent}
          opacity={0.9}
        />

        {/* Nose bridge line */}
        <Line x1="32" y1="30" x2="32" y2="36" stroke={colors.border} strokeWidth="1" />

        {/* Chest subtle arc */}
        <Path
          d="M22 48 Q32 54 42 48"
          fill="none"
          stroke={colors.accent}
          strokeWidth="1"
          opacity={0.25}
        />
      </Svg>
    </View>
  );
}

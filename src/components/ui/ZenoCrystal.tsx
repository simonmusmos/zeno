import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

interface ZenoCrystalProps {
  width?: number;
  height?: number;
}

/**
 * Abstract 3D crystal decoration — multi-faced gem with:
 *   - warm gold on lit faces
 *   - deep indigo on shadow faces
 *   - specular highlights and ambient glow
 */
export function ZenoCrystal({ width = 210, height = 320 }: ZenoCrystalProps) {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 210 320">
        <Defs>
          {/* Ambient glow behind crystal */}
          <RadialGradient id="rg_glow" cx="50%" cy="38%" r="52%" gradientUnits="userSpaceOnUse">
            <Stop offset="0%"   stopColor="#C6A969" stopOpacity={0.28} />
            <Stop offset="45%"  stopColor="#4F46E5" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#080D17" stopOpacity={0}    />
          </RadialGradient>

          {/* Face 1 — upper left, bright gold */}
          <LinearGradient id="g_face1" x1="0%" y1="0%" x2="80%" y2="100%">
            <Stop offset="0%"   stopColor="#F5E8B8" stopOpacity={1} />
            <Stop offset="55%"  stopColor="#C6A969" stopOpacity={1} />
            <Stop offset="100%" stopColor="#A08040" stopOpacity={1} />
          </LinearGradient>

          {/* Face 2 — top triangle, mid gold */}
          <LinearGradient id="g_face2" x1="30%" y1="0%" x2="70%" y2="100%">
            <Stop offset="0%"   stopColor="#D4B87A" stopOpacity={1} />
            <Stop offset="100%" stopColor="#7A5A18" stopOpacity={1} />
          </LinearGradient>

          {/* Face 3 — right side, indigo */}
          <LinearGradient id="g_face3" x1="0%" y1="0%" x2="20%" y2="100%">
            <Stop offset="0%"   stopColor="#6366F1" stopOpacity={1} />
            <Stop offset="50%"  stopColor="#4F46E5" stopOpacity={1} />
            <Stop offset="100%" stopColor="#1E1B4B" stopOpacity={1} />
          </LinearGradient>

          {/* Face 4 — bottom, deep navy */}
          <LinearGradient id="g_face4" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%"   stopColor="#1E293B" stopOpacity={1} />
            <Stop offset="100%" stopColor="#05080F" stopOpacity={1} />
          </LinearGradient>

          {/* Face 5 — inner fold, blue-gold accent */}
          <LinearGradient id="g_face5" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor="#818CF8" stopOpacity={0.55} />
            <Stop offset="100%" stopColor="#4F46E5" stopOpacity={0}    />
          </LinearGradient>

          {/* Specular — top bright highlight */}
          <LinearGradient id="g_spec" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity={0.55} />
            <Stop offset="100%" stopColor="#F5E8B8" stopOpacity={0}    />
          </LinearGradient>
        </Defs>

        {/* Ambient glow */}
        <Ellipse cx="105" cy="148" rx="100" ry="140" fill="url(#rg_glow)" />

        {/* ── Faces back → front ──────────────────── */}

        {/* Silhouette / base shadow */}
        <Path
          d="M102 18 L185 98 L160 282 L72 300 L14 205 L36 92 Z"
          fill="#04070D"
          opacity={0.55}
        />

        {/* Face 1: left + upper — bright gold */}
        <Path
          d="M102 18 L115 108 L82 210 L14 205 L36 92 Z"
          fill="url(#g_face1)"
        />

        {/* Face 2: top-right triangle — mid gold */}
        <Path
          d="M102 18 L185 98 L115 108 Z"
          fill="url(#g_face2)"
        />

        {/* Face 3: right — indigo shadow */}
        <Path
          d="M185 98 L160 282 L98 262 L82 210 L115 108 Z"
          fill="url(#g_face3)"
        />

        {/* Face 4: bottom — dark */}
        <Path
          d="M14 205 L82 210 L98 262 L160 282 L72 300 Z"
          fill="url(#g_face4)"
        />

        {/* Face 5: fold inner — blue accent */}
        <Path
          d="M115 108 L82 210 L98 262 Z"
          fill="url(#g_face5)"
        />

        {/* Specular patch — top face */}
        <Path
          d="M102 18 L155 84 L118 106 L76 76 Z"
          fill="url(#g_spec)"
          opacity={0.55}
        />

        {/* Tiny top-vertex specular */}
        <Path
          d="M102 18 L130 52 L112 66 L86 40 Z"
          fill="#FFFFFF"
          opacity={0.18}
        />

        {/* Ridge edge — bright hairline */}
        <Path
          d="M115 108 L82 210"
          fill="none"
          stroke="#E8D5A0"
          strokeWidth={0.9}
          opacity={0.35}
        />

        {/* Bottom edge reflection */}
        <Path
          d="M14 205 L72 300"
          fill="none"
          stroke="#C6A969"
          strokeWidth={0.6}
          opacity={0.2}
        />
      </Svg>
    </View>
  );
}

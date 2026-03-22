import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

// ─── Colour palette ────────────────────────────────────────────────────────
// Index matches the values in OWL grid below
const PALETTE: (string | null)[] = [
  null,       // 0  transparent
  '#142046',  // 1  dark navy  – head / body
  '#D4A520',  // 2  rich gold  – eye rings, ear-tufts
  '#EDE8D0',  // 3  cream      – face
  '#07090F',  // 4  near-black – pupils
  '#FFFFFF',  // 5  white      – specular highlight
  '#C47808',  // 6  amber      – beak
  '#F4A0A0',  // 7  pink       – blush marks
];

// ─── Pixel grid ─────────────────────────────────────────────────────────────
// 16 wide × 14 tall.  Visualised with colours above.
//
//   . . . . . . . . . . . . . . . .   row 0  blank
//   . . N N N N N N N N N N N N . .   row 1  head top
//   . N N G G N N N N N N G G N N .   row 2  ear-tuft base (gold)
//   N G G N N N N N N N N N N G G N   row 3  ear-tuft peak
//   . N N N N N N N N N N N N N N .   row 4  head
//   . N C C C C N N N N C C C C N .   row 5  eye cream bg
//   . N G G G C C N N C C G G G N .   row 6  gold ring outer
//   . N G P P G C N N C G P P G N .   row 7  pupils
//   . N W G G G C N N C G G G W N .   row 8  specular
//   . N G G G G C N N C G G G G N .   row 9  gold ring bottom
//   . N C C C C N N N N C C C C N .   row10  below eyes
//   . . N N N N O O O O N N N N . .   row11  beak top
//   . . N K N N O O O O N N K N . .   row12  blush + beak
//   . . . . N N N N N N N N . . . .   row13  chin
const OWL: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,2,2,1,1,1,1,1,1,2,2,1,1,0],
  [1,2,2,1,1,1,1,1,1,1,1,1,1,2,2,1],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,3,3,3,3,1,1,1,1,3,3,3,3,1,0],
  [0,1,2,2,2,3,3,1,1,3,3,2,2,2,1,0],
  [0,1,2,4,4,2,3,1,1,3,2,4,4,2,1,0],
  [0,1,5,2,2,2,3,1,1,3,2,2,2,5,1,0],
  [0,1,2,2,2,2,3,1,1,3,2,2,2,2,1,0],
  [0,1,3,3,3,3,1,1,1,1,3,3,3,3,1,0],
  [0,0,1,1,1,1,6,6,6,6,1,1,1,1,0,0],
  [0,0,1,7,1,1,6,6,6,6,1,1,7,1,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
];

const GRID_W = 16;
const GRID_H = 14;

// ─── Helpers ────────────────────────────────────────────────────────────────
// SVG viewBox is wider/taller than the grid to accommodate the coin overlay
// SVG units == pixels, viewBox: "0 0 {SVG_W} {SVG_H}" rendered at size*SVG_W × size*SVG_H
// We add 2 extra cols on the right + 2 extra rows on the bottom for the coin
const VB_W = GRID_W + 2; // 18
const VB_H = GRID_H + 2; // 16

// 5-pointed star polygon string, centred at (cx,cy)
function starPoints(cx: number, cy: number, ro: number, ri: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? ro : ri;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(' ');
}

// ─── Component ──────────────────────────────────────────────────────────────
interface PixelOwlProps {
  /** Width of one pixel square in dp. Default 13. */
  pixelSize?: number;
}

export function PixelOwl({ pixelSize: p = 13 }: PixelOwlProps) {
  const w = VB_W * p;
  const h = VB_H * p;

  // Coin: bottom-right, overlapping owl slightly
  const coinCX = 14.8;  // in viewBox units
  const coinCY = 12.2;
  const coinR  = 2.4;

  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {/* ── Owl pixels ─────────────────────────────────── */}
        {OWL.flatMap((row, ry) =>
          row.map((cell, cx) => {
            const color = PALETTE[cell];
            if (!color) return null;
            return (
              <Rect
                key={`${ry}-${cx}`}
                x={cx}
                y={ry}
                width={1}
                height={1}
                fill={color}
              />
            );
          })
        )}

        {/* ── Gold coin – bottom-right ────────────────────── */}
        {/* Outer gold ring */}
        <Circle cx={coinCX} cy={coinCY} r={coinR} fill="#D4A520" />
        {/* Mid dark ring */}
        <Circle cx={coinCX} cy={coinCY} r={coinR * 0.82} fill="#9E6808" />
        {/* Inner gold face */}
        <Circle cx={coinCX} cy={coinCY} r={coinR * 0.72} fill="#C8900E" />
        {/* 5-pointed star */}
        <Polygon
          points={starPoints(coinCX, coinCY, coinR * 0.48, coinR * 0.22)}
          fill="#F0C030"
        />
      </Svg>
    </View>
  );
}

/**
 * Zeno — Midnight Owl
 * Matched to pixel-art owl logo: deep navy cosmos + warm coin gold.
 */
export const colors = {
  // Core backgrounds — rich navy blue, not charcoal
  background:    '#090E1C',   // deepest navy (logo bg centre)
  surface:       '#0F1A30',   // raised surface navy
  surfaceRaised: '#172040',   // card / sheet navy
  surfaceSubtle: 'rgba(255,255,255,0.05)',

  // Brand
  accent:        '#D4A520',   // logo coin gold — warm, rich
  accentDim:     'rgba(212,165,32,0.22)',
  primary:       '#C08B14',   // golden primary (matches coin edge)
  primaryGlow:   'rgba(212,165,32,0.28)',

  // Semantic
  error:         '#EF4444',
  errorBg:       'rgba(239,68,68,0.08)',
  success:       '#22C55E',
  assetColor:    '#34D399',
  liabilityColor:'#F87171',

  // Text — warm cream hierarchy (owl body tones)
  textPrimary:   '#EDE8D8',   // warm cream white
  textSecondary: '#8A9CC0',   // cool slate-blue
  textMuted:     '#4E6080',   // muted navy-blue
  textDisabled:  '#2A3A58',

  // Borders — navy family
  border:        '#1C2A48',
  borderSubtle:  'rgba(255,255,255,0.07)',

  // Utility
  transparent:   'transparent',
  white:         '#FFFFFF',
  black:         '#000000',
} as const;

export type ColorKey = keyof typeof colors;

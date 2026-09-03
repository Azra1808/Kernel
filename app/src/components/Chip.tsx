import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';

export type ChipTone = 'neutral' | 'moss' | 'gold' | 'clay';

type ChipProps = {
  label: string;
  tone?: ChipTone;
};

const TONE_STYLES: Record<ChipTone, { bg: string; text: string }> = {
  neutral: { bg: colors.line, text: colors.ink },
  moss: { bg: colors.mossPale, text: colors.moss },
  gold: { bg: colors.goldPale, text: '#8A5F1E' },
  clay: { bg: colors.clayPale, text: colors.clay },
};

/** Utilisé pour les statuts (À faire/En cours/Terminé/Bloqué, plein/partiel/vide, etc.) */
export function Chip({ label, tone = 'neutral' }: ChipProps) {
  const { bg, text } = TONE_STYLES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
  },
});

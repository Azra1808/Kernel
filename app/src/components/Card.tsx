import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius } from '../theme/colors';

type CardProps = ViewProps & {
  /** Fond légèrement teinté (ex. carte module) plutôt que blanc pur */
  tone?: 'paper' | 'moss' | 'clay' | 'gold';
};

const TONE_BG: Record<NonNullable<CardProps['tone']>, string> = {
  paper: colors.paperWarm,
  moss: colors.mossPale,
  clay: colors.clayPale,
  gold: colors.goldPale,
};

export function Card({ tone = 'paper', style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, { backgroundColor: TONE_BG[tone] }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
});

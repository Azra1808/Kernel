import { useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { radius, type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';

type CardProps = ViewProps & {
  /** Fond légèrement teinté (ex. carte module) plutôt que blanc pur */
  tone?: 'paper' | 'moss' | 'clay' | 'gold';
};

export function Card({ tone = 'paper', style, children, ...rest }: CardProps) {
  const { colors } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const toneBg: Record<NonNullable<CardProps['tone']>, string> = {
    paper: colors.paperWarm,
    moss: colors.mossPale,
    clay: colors.clayPale,
    gold: colors.goldPale,
  };

  return (
    <View style={[styles.card, { backgroundColor: toneBg[tone] }, style]} {...rest}>
      {children}
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: 16,
    },
  });
}

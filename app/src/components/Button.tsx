import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { radius, type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { AnimatedPressable } from './AnimatedPressable';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const { colors, fontScale } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={label}
      style={[styles.base, variantStyles(colors)[variant], isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.accent} />
      ) : (
        <Text style={[styles.label, variant === 'primary' ? styles.labelOnDark : styles.labelOnLight]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

function createStyles(colors: Palette, fontScale: number) {
  return StyleSheet.create({
    base: {
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.base * fontScale,
    },
    labelOnDark: {
      color: colors.white,
    },
    labelOnLight: {
      color: colors.accent,
    },
  });
}

function variantStyles(colors: Palette) {
  return StyleSheet.create({
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  });
}

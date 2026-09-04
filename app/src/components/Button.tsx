import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.paper : colors.clay} />
      ) : (
        <Text style={[styles.label, variant === 'primary' ? styles.labelOnDark : styles.labelOnLight]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
  },
  labelOnDark: {
    color: colors.paper,
  },
  labelOnLight: {
    color: colors.clay,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.clay,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.clay,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

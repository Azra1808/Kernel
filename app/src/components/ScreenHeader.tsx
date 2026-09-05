import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../theme/colors';

type ScreenHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ScreenHeader({ title, subtitle, actionLabel = 'Notifications', onAction }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Feather color={colors.ink} name="bell" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: { flex: 1 },
  title: {
    color: colors.ink,
    fontFamily: fontFamily.displaySemibold,
    fontSize: 26,
    lineHeight: 31,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    marginTop: 2,
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.paperWarm,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    marginLeft: spacing.md,
    width: 38,
  },
  pressed: { opacity: 0.7 },
});

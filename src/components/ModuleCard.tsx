import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, shadow, spacing } from '../theme/colors';

type FeatherName = ComponentProps<typeof Feather>['name'];
type ModuleTone = 'moss' | 'gold' | 'clay';

const toneStyles = {
  moss: { iconBackground: colors.mossPale, iconColor: colors.moss },
  gold: { iconBackground: colors.goldPale, iconColor: colors.warning },
  clay: { iconBackground: colors.clayPale, iconColor: colors.clay },
} as const;

type ModuleCardProps = {
  title: string;
  meta: string;
  stat: string;
  icon: FeatherName;
  tone: ModuleTone;
  shape?: 'leaf' | 'crate' | 'regular';
  onPress: () => void;
};

export function ModuleCard({ title, meta, stat, icon, tone, shape = 'regular', onPress }: ModuleCardProps) {
  const toneStyle = toneStyles[tone];
  return (
    <Pressable
      accessibilityHint={`Ouvre le module ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles[shape], shadow.card, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: toneStyle.iconBackground }]}>
        <Feather color={toneStyle.iconColor} name={icon} size={21} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Text style={styles.stat}>{stat}</Text>
      <Feather color={colors.muted} name="chevron-right" size={17} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.paperWarm,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  leaf: { borderBottomLeftRadius: 10, borderTopRightRadius: 10, borderBottomRightRadius: 22, borderTopLeftRadius: 22 },
  crate: { borderBottomLeftRadius: 22, borderTopRightRadius: 22, borderBottomRightRadius: 10, borderTopLeftRadius: 10 },
  regular: {},
  icon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: { flex: 1 },
  title: {
    color: colors.ink,
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
  },
  meta: {
    color: colors.muted,
    fontFamily: fontFamily.body,
    fontSize: 11,
    marginTop: 3,
  },
  stat: {
    color: colors.ink,
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});

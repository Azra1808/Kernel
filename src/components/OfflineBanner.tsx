import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../theme/colors';

type OfflineBannerProps = { lastSync?: string };

export function OfflineBanner({ lastSync = '09:12' }: OfflineBannerProps) {
  return (
    <View accessibilityRole="text" style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.label}>Hors ligne — dernière synchro {lastSync}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.shell,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  dot: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  label: {
    color: colors.paper,
    fontFamily: fontFamily.bodySemibold,
    fontSize: 11,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme/colors';

type SignalBreakdownProps = {
  plantDiseases: number;
  wastePoints: number;
  healthyDays: number;
};

const rows = [
  { key: 'plantDiseases', label: 'Maladies de plantes', color: colors.clay },
  { key: 'wastePoints', label: 'Points de déchets', color: colors.gold },
  { key: 'healthyDays', label: 'Jours sans alerte élevée', color: colors.moss },
] as const;

export function SignalBreakdown(props: SignalBreakdownProps) {
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View key={row.key} style={[styles.row, index > 0 && styles.divider]}>
          <View style={[styles.dot, { backgroundColor: row.color }]} />
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{props[row.key]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperWarm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  divider: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dot: { borderRadius: 5, height: 9, marginRight: spacing.md, width: 9 },
  label: {
    color: colors.body,
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
  value: {
    color: colors.ink,
    fontFamily: fontFamily.displayBold,
    fontSize: 17,
  },
});

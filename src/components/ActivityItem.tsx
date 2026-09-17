import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../theme/colors';

type ActivityItemProps = { label: string; time: string };

export function ActivityItem({ label, time }: ActivityItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 40,
    paddingVertical: spacing.sm,
  },
  dot: {
    backgroundColor: colors.moss,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  label: {
    color: colors.body,
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 12,
  },
  time: {
    color: colors.muted,
    fontFamily: fontFamily.body,
    fontSize: 11,
  },
});

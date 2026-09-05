import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme/colors';

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type TrendChartProps = { values: number[]; total: number };

export function TrendChart({ values, total }: TrendChartProps) {
  const safeValues = [...Array(7)].map((_, index) => values[index] ?? 0);
  const maximum = Math.max(...safeValues, 1);

  return (
    <View style={styles.card}>
      <Text style={styles.total}>{total}</Text>
      <Text style={styles.label}>Signaux remontés cette semaine</Text>
      <View accessibilityLabel={`Tendance sur sept jours : ${safeValues.join(', ')}`} style={styles.chart}>
        {safeValues.map((value, index) => (
          <View key={`${index}-${value}`} style={styles.column}>
            <View
              style={[
                styles.bar,
                { height: `${Math.max(8, Math.round((value / maximum) * 100))}%` },
                value === maximum && styles.peak,
              ]}
            />
            <Text style={styles.day}>{dayLabels[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperWarm,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  total: {
    color: colors.ink,
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
  },
  label: {
    color: colors.muted,
    fontFamily: fontFamily.body,
    fontSize: 12,
    marginBottom: spacing.lg,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 7,
    height: 90,
  },
  column: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: colors.mossPale,
    borderRadius: 5,
    minHeight: 5,
    width: '100%',
  },
  peak: { backgroundColor: colors.moss },
  day: {
    color: colors.muted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 9,
    marginTop: 4,
  },
});

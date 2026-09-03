import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityItem } from '../components/ActivityItem';
import { AppScreen } from '../components/AppScreen';
import { ModuleCard } from '../components/ModuleCard';
import { OfflineBanner } from '../components/OfflineBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { colors, fontFamily, spacing } from '../theme/colors';

type Props = BottomTabScreenProps<RootTabParamList, 'Accueil'>;

export default function AccueilScreen({ navigation }: Props) {
  return (
    <AppScreen testID="home-screen">
      <ScreenHeader onAction={() => undefined} subtitle="Sabalibougou · aujourd'hui" title="Bonjour, Awa" />
      <View style={styles.bannerSpacing}>
        <OfflineBanner />
      </View>

      <View style={styles.modules}>
        <ModuleCard
          icon="feather"
          meta="3 diagnostics cette semaine"
          onPress={() => navigation.navigate('Agriculture')}
          shape="leaf"
          stat="92%"
          title="Agriculture"
          tone="moss"
        />
        <ModuleCard
          icon="archive"
          meta="2 points à collecter"
          onPress={() => navigation.navigate('Ressources')}
          shape="crate"
          stat="6"
          title="Ressources"
          tone="gold"
        />
        <ModuleCard
          icon="globe"
          meta="Indice de santé local"
          onPress={() => navigation.navigate('Ecosysteme')}
          stat="Bon"
          title="Écosystème"
          tone="clay"
        />
      </View>

      <Text style={styles.sectionTitle}>Activité récente</Text>
      <View accessibilityLabel="Activité récente">
        <ActivityItem label="Fatou a signalé un point plein" time="2h" />
        <ActivityItem label="Diagnostic manioc enregistré" time="hier" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bannerSpacing: {
    marginTop: spacing.lg,
  },
  modules: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: fontFamily.displaySemibold,
    fontSize: 18,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
});

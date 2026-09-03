import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Icon } from '../theme/Icon';
import { fonts, fontSize } from '../theme/typography';

export type SyncState = 'online' | 'offline' | 'syncing';

type StatusBadgeProps = {
  state: SyncState;
};

const LABELS: Record<SyncState, string> = {
  online: 'En ligne',
  offline: 'Hors ligne — données en attente',
  syncing: 'Synchronisation...',
};

/**
 * Reprend le "bandeau hors-ligne" (offline-strip) de la maquette :
 * pastille sombre, point doré qui indique l'activité, libellé court.
 * Utilisé sur l'écran Accueil et partout où l'état réseau doit être
 * visible sans interrompre l'utilisateur (principe offline-first).
 */
export function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <View style={styles.strip}>
      {state === 'offline' ? (
        <Icon name="wifioff" size={12} color={colors.paper} strokeWidth={2} />
      ) : (
        <View style={[styles.dot, state === 'syncing' && styles.dotSyncing]} />
      )}
      <Text style={styles.label}>{LABELS[state]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.shell,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  dotSyncing: {
    backgroundColor: colors.moss,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.paper,
  },
});

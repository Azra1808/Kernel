import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Chip, ChipTone } from '../components/Chip';
import { Button } from '../components/Button';
import { StatusBadge, SyncState } from '../components/StatusBadge';
import { WasteReportForm } from '../components/WasteReportForm';
import {
  fetchAndCacheWastePoints,
  getWastePointsWithStatus,
  submitWasteReport,
  WastePointWithStatus,
  WasteStatus,
} from '../data/wastePoints';

const STATUS_LABEL: Record<WasteStatus, string> = {
  plein: 'Plein',
  partiel: 'Partiel',
  vide: 'Vide',
};

const STATUS_TONE: Record<WasteStatus, ChipTone> = {
  plein: 'clay',
  partiel: 'gold',
  vide: 'moss',
};

// Module Ressources — tâches n°12 (liste des points de collecte) et n°13
// (formulaire de signalement). Le tri par urgence réel arrive à la
// tâche n°14 ; en attendant, getWastePointsWithStatus() applique un tri
// simple (plein > partiel > vide > jamais signalé).
export default function RessourcesScreen() {
  const [points, setPoints] = useState<WastePointWithStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<WastePointWithStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFromCache = useCallback(async () => {
    const rows = await getWastePointsWithStatus();
    setPoints(rows);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Best-effort : si offline, ça échoue silencieusement et on garde
      // simplement ce qui est déjà en cache local.
      await fetchAndCacheWastePoints();
    } finally {
      await loadFromCache();
      setRefreshing(false);
    }
  }, [loadFromCache]);

  useEffect(() => {
    refresh();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitReport = async (status: WasteStatus, note: string) => {
    if (!selectedPoint) return;
    setSubmitting(true);
    try {
      await submitWasteReport(selectedPoint.id, status, note || null);
      await loadFromCache();
      setSelectedPoint(null);
    } finally {
      setSubmitting(false);
    }
  };

  const syncState: SyncState = !isOnline ? 'offline' : refreshing ? 'syncing' : 'online';

  return (
    <View style={styles.container}>
      <FlatList
        data={points}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <StatusBadge state={syncState} />
            <View style={styles.brandRow}>
              <Icon name="crate" color={colors.clay} size={22} />
              <Text style={styles.title}>Ressources</Text>
            </View>
            <Text style={styles.subtitle}>
              Points de collecte du quartier, triés par urgence.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucun point de collecte en cache pour l’instant. Tire vers le bas pour réessayer.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.pointCard}>
            <View style={styles.pointHeader}>
              <Text style={styles.pointName}>{item.name}</Text>
              {item.latestStatus ? (
                <Chip label={STATUS_LABEL[item.latestStatus]} tone={STATUS_TONE[item.latestStatus]} />
              ) : (
                <Chip label="Pas encore signalé" tone="neutral" />
              )}
            </View>
            {item.neighborhood ? <Text style={styles.pointMeta}>{item.neighborhood}</Text> : null}
            {item.latestNote ? <Text style={styles.pointNote}>« {item.latestNote} »</Text> : null}
            {item.pendingCount > 0 ? (
              <View style={styles.pendingRow}>
                <Icon name="wifioff" size={12} color={colors.muted} />
                <Text style={styles.pendingText}>
                  {item.pendingCount} signalement{item.pendingCount > 1 ? 's' : ''} en attente de
                  synchro
                </Text>
              </View>
            ) : null}
            <Button label="Signaler" variant="secondary" onPress={() => setSelectedPoint(item)} />
          </Card>
        )}
      />

      <WasteReportForm
        visible={selectedPoint !== null}
        pointName={selectedPoint?.name ?? ''}
        submitting={submitting}
        onCancel={() => setSelectedPoint(null)}
        onSubmit={handleSubmitReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  headerBlock: {
    gap: 8,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  title: {
    fontFamily: fonts.titleBold,
    fontSize: fontSize.xxl,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  pointCard: {
    gap: 8,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    flex: 1,
  },
  pointMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  pointNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});

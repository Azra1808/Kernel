import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { runSync } from './syncEngine';

const PERIODIC_SYNC_INTERVAL_MS = 30_000;

/**
 * À monter une seule fois, à la racine de l'app (App.tsx).
 * Déclenche une synchronisation :
 *  - dès que l'appareil retrouve une connexion réseau,
 *  - toutes les 30s tant qu'une connexion est présente (filet de sécurité,
 *    ex. si une requête précédente a échoué pour une autre raison que le
 *    réseau).
 */
export function useAutoSync(): void {
  const wasOffline = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      if (isOnline && wasOffline.current) {
        runSync().catch((err) => {
          if (__DEV__) console.warn('[sync] erreur de synchronisation:', err);
        });
      }
      wasOffline.current = !isOnline;
    });

    const interval = setInterval(() => {
      runSync().catch(() => {
        /* silencieux : on retentera au prochain tick ou à la prochaine reconnexion */
      });
    }, PERIODIC_SYNC_INTERVAL_MS);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);
}

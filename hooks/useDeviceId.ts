import { useState, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import { getDeviceId, setDeviceId } from '../services/storage';

/**
 * Returns a stable UUID for this device.
 * Generated once on first launch, persisted in SecureStore.
 * On iOS: survives app reinstalls (Keychain). On Android: reset on reinstall.
 */
export function useDeviceId(): { deviceId: string | null; isLoading: boolean } {
  const [deviceId, setDeviceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let id = await getDeviceId();
        if (!id) {
          id = Crypto.randomUUID();
          await setDeviceId(id);
        }
        if (!cancelled) setDeviceIdState(id);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { deviceId, isLoading };
}

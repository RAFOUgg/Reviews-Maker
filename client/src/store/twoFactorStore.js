import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * REVIEWS-MAKER MVP - 2FA Store
 * Gestion de l'authentification à deux facteurs
 */

export const use2FAStore = create(
  persist(
    (set, get) => ({
      // État
      isEnabled: false,
      qrCode: null,
      backupCodes: [],
      lastVerified: null,

      // Actions
      enable2FA: (qrCode, backupCodes) => {
        set({
          isEnabled: true,
          qrCode,
          backupCodes,
          lastVerified: new Date().toISOString(),
        });
      },

      disable2FA: () => {
        set({
          isEnabled: false,
          qrCode: null,
          backupCodes: [],
          lastVerified: null,
        });
      },

      updateLastVerified: () => {
        set({ lastVerified: new Date().toISOString() });
      },

      needs2FA: () => {
        const { isEnabled, lastVerified } = get();
        if (!isEnabled) return false;

        // Vérifier si la dernière vérification date de plus de 30 jours
        if (!lastVerified) return true;

        const lastDate = new Date(lastVerified);
        const now = new Date();
        const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);

        return daysSince > 30;
      },
    }),
    {
      name: 'reviews-maker-2fa',
      version: 1,
    }
  )
);

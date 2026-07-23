import { create } from 'zustand'

/**
 * État global de la modal de profil — même pattern que useToastStore
 * (client/src/components/shared/ToastContainer.jsx). Permet à n'importe quel composant, même
 * profondément imbriqué (templates d'export, canevas React Flow, cartes de galerie), d'ouvrir la
 * modal profil d'un utilisateur sans prop drilling. Une seule <ProfileModal /> est montée
 * globalement dans App.jsx et lit cet état.
 */
export const useProfileModalStore = create((set) => ({
    open: false,
    userId: null,
    openProfile: (userId) => set({ open: true, userId }),
    close: () => set({ open: false, userId: null }),
}))

export default useProfileModalStore

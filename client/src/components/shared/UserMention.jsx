import useProfileModalStore from '../../store/useProfileModalStore'

/**
 * Mention cliquable d'un compte (auteur, ou farm/hashmaker/fabricant lié via
 * FillMyselfButton/FillCompanyButton) — ouvre la ProfileModal au clic. Sans `userId` résolu (texte
 * libre historique jamais lié à un vrai compte), rend `children` en texte brut sans interactivité :
 * ne jamais laisser croire qu'une mention non résolue mène quelque part.
 */
export default function UserMention({ userId, className = '', children }) {
    if (!userId) {
        return <span className={className}>{children}</span>
    }

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                useProfileModalStore.getState().openProfile(userId)
            }}
            className={`hover:underline decoration-dotted underline-offset-2 text-left ${className}`}
        >
            {children}
        </button>
    )
}

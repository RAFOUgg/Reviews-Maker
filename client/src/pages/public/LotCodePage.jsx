import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * /l/:code — lien court imprimé dans le QR d'une étiquette de lot (L16, parcours C de la démo :
 * « QR sur sachet → fiche publique lisible au téléphone »). Résout le code puis remplace l'URL par
 * /r/:id : le visiteur arrive sur la fiche vivante, et un retour arrière ne repasse pas par ici.
 *
 * Les droits sont ceux de la lecture par id : une review repassée en privé après impression du QR
 * ne s'ouvre plus (403) — le code ne donne jamais accès à plus que l'id.
 */
export default function LotCodePage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/reviews/by-code/${encodeURIComponent(code || '')}`, { credentials: 'include' })
            .then(async (res) => {
                if (cancelled) return;
                if (res.ok) {
                    const { id } = await res.json();
                    navigate(`/r/${id}`, { replace: true });
                } else {
                    setError(res.status === 403 ? 'forbidden' : 'not_found');
                }
            })
            .catch(() => !cancelled && setError('network'));
        return () => { cancelled = true; };
    }, [code, navigate]);

    const messages = {
        forbidden: ['Fiche non publique', "Ce lot existe, mais son producteur ne l'a pas (ou plus) rendu public."],
        not_found: ['Code inconnu', `Aucun lot ne correspond au code « ${code} ». Vérifiez les caractères imprimés.`],
        network: ['Connexion impossible', 'Réessayez dans un instant.'],
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-[#0a0a0f] text-white">
            {error ? (
                <div className="max-w-sm text-center">
                    <h1 className="text-xl font-bold mb-2">{messages[error][0]}</h1>
                    <p className="text-white/60 text-sm">{messages[error][1]}</p>
                </div>
            ) : (
                <p className="text-white/50 text-sm" aria-live="polite">Ouverture de la fiche…</p>
            )}
        </div>
    );
}

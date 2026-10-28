import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

/**
 * /l/:code/etiquette — étiquette de lot imprimable : QR (vers /l/:code), code lisible à la main
 * (repli si le QR est abîmé), nom du produit. Format carte 85×55 mm — se colle sur un sachet.
 * Le QR pointe sur le lien COURT, pas sur /r/:id : moins de modules, donc lisible même imprimé petit.
 */
export default function LotLabelPage() {
    const { code } = useParams();
    const [review, setReview] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/reviews/by-code/${encodeURIComponent(code || '')}`, { credentials: 'include' });
            if (!res.ok) { setError(res.status); return; }
            const { id } = await res.json();
            const detail = await fetch(`/api/reviews/${id}`, { credentials: 'include' });
            setReview(detail.ok ? await detail.json() : { id });
        })().catch(() => setError('network'));
    }, [code]);

    const url = `${window.location.origin}/l/${code}`;
    if (error) {
        return <div className="p-8 text-center text-white/70">Étiquette indisponible ({error === 403 ? 'fiche non publique' : 'code inconnu'}).</div>;
    }

    return (
        <div className="min-h-[100dvh] bg-neutral-200 print:bg-white flex flex-col items-center justify-center gap-6 p-6">
            {/* À l'impression, SEULE l'étiquette sort : le bandeau global « Réduction des risques » et tout
                le reste de l'app sont rendus invisibles, l'étiquette est collée au coin de la page. */}
            <style>{'@page { size: 85mm 55mm; margin: 0; } @media print { body * { visibility: hidden !important; } [data-lot-label], [data-lot-label] * { visibility: visible !important; } [data-lot-label] { position: fixed; left: 0; top: 0; box-shadow: none !important; } }'}</style>
            <div
                data-lot-label
                className="bg-white text-black flex items-center gap-[4mm] p-[4mm] shadow-lg print:shadow-none"
                style={{ width: '85mm', height: '55mm', boxSizing: 'border-box' }}
            >
                <QRCodeSVG value={url} size={150} level="M" style={{ width: '32mm', height: '32mm', flexShrink: 0 }} />
                <div className="min-w-0 flex flex-col justify-center">
                    <div className="text-[8pt] uppercase tracking-[0.15em] text-neutral-500">Lot</div>
                    <div className="font-mono text-[15pt] font-bold tracking-wider leading-none" data-lot-code>{code}</div>
                    <div className="mt-[2mm] text-[10pt] font-semibold leading-tight line-clamp-2">{review?.holderName || review?.name || ''}</div>
                    <div className="mt-[2mm] text-[7pt] text-neutral-500 leading-tight">Scannez pour la fiche complète<br />{url.replace(/^https?:\/\//, '')}</div>
                </div>
            </div>
            <button onClick={() => window.print()} className="no-print px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold">
                Imprimer l'étiquette
            </button>
        </div>
    );
}

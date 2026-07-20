import { useEffect, useRef, useState } from 'react'

/**
 * Bouton d'abonnement PayPal.
 *
 * Charge le SDK PayPal à la demande et rend le bouton officiel. À l'approbation, PayPal renvoie un
 * `subscriptionID` qui est transmis tel quel au serveur : c'est lui seul qui interroge PayPal pour
 * savoir si l'abonnement est réellement actif. Ce composant n'accorde donc aucun droit par lui-même.
 */

// Le SDK s'injecte une seule fois par configuration (client id + devise) ; on mémorise la promesse
// pour que plusieurs boutons montés en parallèle ne déclenchent pas plusieurs chargements.
const sdkLoaders = new Map()

function loadPaypalSdk(clientId) {
    const key = clientId
    if (sdkLoaders.has(key)) return sdkLoaders.get(key)

    const promise = new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            'client-id': clientId,
            vault: 'true',
            intent: 'subscription',
            currency: 'EUR',
        })
        const script = document.createElement('script')
        script.src = `https://www.paypal.com/sdk/js?${params.toString()}`
        script.async = true
        script.onload = () => resolve(window.paypal)
        script.onerror = () => {
            // Un échec de chargement doit pouvoir être retenté (réseau, bloqueur de pub).
            sdkLoaders.delete(key)
            reject(new Error('Impossible de charger PayPal'))
        }
        document.body.appendChild(script)
    })

    sdkLoaders.set(key, promise)
    return promise
}

export default function PayPalSubscribeButton({ clientId, planId, userId, onApproved, onError }) {
    const containerRef = useRef(null)
    const [status, setStatus] = useState('loading') // loading | ready | failed

    // Les callbacks sont lus via une ref : le bouton PayPal n'est rendu qu'une fois, il ne doit pas
    // être détruit/recréé à chaque re-render du parent.
    const handlersRef = useRef({ onApproved, onError })
    handlersRef.current = { onApproved, onError }

    useEffect(() => {
        if (!clientId || !planId) return

        let cancelled = false
        let buttons = null

        loadPaypalSdk(clientId)
            .then((paypal) => {
                if (cancelled || !containerRef.current) return

                buttons = paypal.Buttons({
                    style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'subscribe' },
                    createSubscription: (data, actions) =>
                        actions.subscription.create({
                            plan_id: planId,
                            // Rattache l'abonnement au compte : le serveur s'en sert pour vérifier
                            // que celui qui l'active en est bien le souscripteur.
                            custom_id: userId,
                        }),
                    onApprove: (data) => handlersRef.current.onApproved?.(data.subscriptionID),
                    onError: (err) => handlersRef.current.onError?.(err),
                })

                return buttons.render(containerRef.current).then(() => {
                    if (!cancelled) setStatus('ready')
                })
            })
            .catch((err) => {
                if (cancelled) return
                setStatus('failed')
                handlersRef.current.onError?.(err)
            })

        return () => {
            cancelled = true
            // `close()` peut lever si le bouton n'a jamais fini de se rendre — sans intérêt au démontage.
            try { buttons?.close() } catch { /* ignoré */ }
        }
    }, [clientId, planId, userId])

    return (
        <div>
            <div ref={containerRef} />
            {status === 'loading' && (
                <p className="text-sm text-white/40 text-center py-4">Chargement de PayPal…</p>
            )}
            {status === 'failed' && (
                <p className="text-sm text-red-400 text-center py-4">
                    PayPal n’a pas pu être chargé. Vérifiez votre connexion ou votre bloqueur de publicités.
                </p>
            )}
        </div>
    )
}

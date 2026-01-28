import React from 'react'
import { Clock, Download, Receipt, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

/**
 * SubscriptionHistory - Affiche l'historique des abonnements et paiements
 * Affiche: Transactions passées, factures, dates de renouvellement
 */
export default function SubscriptionHistory({ subscriptionHistory = [] }) {
  // Données de démonstration (sera remplacé par API)
  const mockHistory = subscriptionHistory.length > 0 ? subscriptionHistory : [
    {
      id: '1',
      type: 'subscription_start',
      date: '2026-01-15T10:00:00Z',
      amount: 29.99,
      status: 'success',
      plan: 'Producteur',
      period: 'mensuel',
      invoice: 'INV-2026-001'
    },
    {
      id: '2',
      type: 'payment',
      date: '2025-12-15T10:00:00Z',
      amount: 29.99,
      status: 'success',
      plan: 'Producteur',
      period: 'mensuel',
      invoice: 'INV-2025-012'
    },
    {
      id: '3',
      type: 'payment',
      date: '2025-11-15T10:00:00Z',
      amount: 29.99,
      status: 'success',
      plan: 'Producteur',
      period: 'mensuel',
      invoice: 'INV-2025-011'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'success':
        return 'Payé'
      case 'failed':
        return 'Échoué'
      case 'pending':
        return 'En attente'
      default:
        return 'Inconnu'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'subscription_start':
        return 'Début abonnement'
      case 'subscription_upgrade':
        return 'Upgrade'
      case 'subscription_downgrade':
        return 'Downgrade'
      case 'subscription_cancel':
        return 'Annulation'
      case 'payment':
        return 'Renouvellement'
      case 'refund':
        return 'Remboursement'
      default:
        return type
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (mockHistory.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
        <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">Aucun historique d'abonnement</p>
        <p className="text-sm text-gray-500 mt-1">
          Vos transactions apparaîtront ici une fois abonné
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Historique des paiements
        </h3>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="divide-y divide-gray-700/50">
          {mockHistory.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-700/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="text-white font-medium">
                      {getTypeLabel(item.type)}
                      {item.plan && <span className="text-gray-400 ml-2">• {item.plan}</span>}
                    </p>
                    <p className="text-sm text-gray-400">{formatDate(item.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      item.type === 'refund' ? 'text-green-400' : 'text-white'
                    }`}>
                      {item.type === 'refund' ? '+' : ''}{item.amount?.toFixed(2)}€
                    </p>
                    <p className={`text-xs ${
                      item.status === 'success' ? 'text-green-400' :
                      item.status === 'failed' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {getStatusLabel(item.status)}
                    </p>
                  </div>

                  {item.invoice && item.status === 'success' && (
                    <button
                      onClick={() => {
                        // TODO: Télécharger la facture
                        console.log('Download invoice:', item.invoice)
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Télécharger la facture"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations de renouvellement */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium">Prochain prélèvement</p>
            <p className="text-sm text-blue-400/80">
              15 février 2026 • 29,99€ (Producteur mensuel)
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
          Modifier le moyen de paiement
        </button>
        <button className="py-2 px-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors">
          Annuler l'abonnement
        </button>
      </div>
    </div>
  )
}

/**
 * Composant eKYC - Upload de documents d'identité
 * Pour comptes Producer et Influencer uniquement
 */

import React, { useState, useEffect } from 'react'
import { Upload, FileText, Check, X, Eye, Trash2, AlertCircle, Shield } from 'lucide-react'

export default function KYCUploader({ userId, accountType }) {
    const [documents, setDocuments] = useState([])
    const [kycStatus, setKycStatus] = useState('none')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedType, setSelectedType] = useState('id_card')
    const [dragActive, setDragActive] = useState(false)

    const documentTypes = [
        { value: 'id_card', label: 'Carte d\'identité', icon: '🪪' },
        { value: 'passport', label: 'Passeport', icon: '🛂' },
        { value: 'driving_license', label: 'Permis de conduire', icon: '🚗' },
        { value: 'business_license', label: 'Licence commerciale', icon: '🏢', producerOnly: true }
    ]

    const statusLabels = {
        none: { label: 'Non vérifié', color: 'bg-gray-500', icon: '❓' },
        pending: { label: 'En attente', color: 'bg-yellow-500', icon: '⏳' },
        verified: { label: 'Vérifié', color: 'bg-green-500', icon: '✅' },
        rejected: { label: 'Rejeté', color: 'bg-red-500', icon: '❌' }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/kyc/documents', {
                credentials: 'include'
            })

            if (!response.ok) throw new Error('Failed to fetch documents')

            const data = await response.json()
            setDocuments(data.documents || [])
            setKycStatus(data.status || 'none')
            setError(null)
        } catch (err) {
}

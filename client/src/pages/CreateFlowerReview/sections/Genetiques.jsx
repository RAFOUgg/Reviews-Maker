import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Info, Plus, Trash2, Edit2, FileText, FolderTree, Upload } from 'lucide-react'
import { ReactFlowProvider } from 'reactflow'
import LiquidCard from '../../../components/LiquidCard'
import PhenoCodeGenerator from '../../../components/genetics/PhenoCodeGenerator'
import UnifiedGeneticsCanvas from '../../../components/genetics/UnifiedGeneticsCanvas'
import useGeneticsStore from '../../../store/useGeneticsStore'
import { useStore } from '../../../store/useStore'

export default function Genetiques({ formData, handleChange }) {
    const [showInitialModal, setShowInitialModal] = useState(true) // Modal de choix initial
    const [activeTab, setActiveTab] = useState('cultivars')
    const [activeTreeTab, setActiveTreeTab] = useState(0)
    const [trees, setTrees] = useState([])
    const [userReviews, setUserReviews] = useState([]) // Reviews fleurs de l'utilisateur
    const [loading, setLoading] = useState(false)

    const genetics = formData.genetics || {}
    const { user } = useStore()
    const geneticsStore = useGeneticsStore()

    const selectedNode = geneticsStore.selectedNodeId
        ? geneticsStore.nodes.find(n => n.id === geneticsStore.selectedNodeId)
        : null

    // Charger les reviews fleurs de l'utilisateur
    useEffect(() => {
        if (user?.id) {
            fetchUserFlowerReviews()
        }
    }, [user?.id])

    const fetchUserFlowerReviews = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/reviews?userId=${user.id}&type=flower`)
            if (response.ok) {
                const data = await response.json()
                setUserReviews(data.reviews || [])
            }
        } catch (error) {
}

import React, { useState, useEffect } from 'react'
import { Users, Settings, Shield, AlertCircle, RefreshCw, Search, Trash2, Lock, Unlock, CheckCircle2, FileCheck, ExternalLink } from 'lucide-react'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'

console.log('📄 AdminPanel.jsx module loaded!')

export default function AdminPanel() {
    console.log('🔨 AdminPanel component function called!')
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('all')
    const [editingUser, setEditingUser] = useState(null)
    const [showBanModal, setShowBanModal] = useState(false)
    const [banReason, setBanReason] = useState('')
    const [authError, setAuthError] = useState(false)
    const [verifications, setVerifications] = useState([])
    const [verificationsLoading, setVerificationsLoading] = useState(true)

    useEffect(() => {
        console.log('🔧 AdminPanel useEffect - checking auth...')
        console.log('🔧 ADMIN_MODE check starting...')
        checkAuth()
        fetchUsers()
        fetchStats()
        fetchVerifications()
    }, [])

    const fetchVerifications = async () => {
        try {
            const response = await fetch('/api/admin/producer-verifications?status=pending', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error('Failed to fetch verifications')
            const data = await response.json()
            setVerifications(data.profiles || [])
        } catch (err) {
            console.error('Error fetching producer verifications:', err)
        } finally {
            setVerificationsLoading(false)
        }
    }

    const reviewVerification = async (id, action) => {
        const reason = action === 'reject' ? window.prompt('Motif du rejet (optionnel) :') || '' : undefined

        try {
            const response = await fetch(`/api/admin/producer-verifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason })
            })
            if (!response.ok) throw new Error('Failed to review verification')
            setVerifications(verifications.filter(v => v.id !== id))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const checkAuth = async () => {
        try {
            console.log('🔐 Calling /api/admin/check-auth')
            const response = await fetch('/api/admin/check-auth', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            console.log('🔐 Response status:', response.status, 'ok:', response.ok)
            const data = await response.json()
            console.log('🔐 Response data:', data)
            if (!response.ok) {
                console.log('🔐 Auth failed (', response.status, ') - setting authError to true')
                console.log('🔐 ADMIN_MODE likely not enabled on server')
                setAuthError(true)
            } else {
                console.log('✅ Auth successful - admin access granted')
            }
        } catch (err) {
            console.error('🔐 Auth error:', err.message)
            console.log('🔐 Likely network error or API not responding')
            setAuthError(true)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            setUsers(Array.isArray(data) ? data : [])
            setLoading(false)
        } catch (err) {
            console.error('Error fetching users:', err)
            setError(err.message)
            setUsers([]) // Ensure users is always an array
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error('Failed to fetch stats')
            const data = await response.json()
            setStats(data)
        } catch (err) {
            console.error('Error fetching stats:', err)
        }
    }

    const changeAccountType = async (userId, newType) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/account-type`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountType: newType })
            })
            if (!response.ok) throw new Error('Failed to update')
            const updated = await response.json()
            setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const changeSubscriptionStatus = async (userId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/subscription`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionStatus: newStatus })
            })
            if (!response.ok) throw new Error('Failed to update')
            const updated = await response.json()
            setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const toggleBan = async (userId, currentBanned) => {
        if (!currentBanned) {
            setEditingUser(userId)
            setShowBanModal(true)
            return
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned: false })
            })
            if (!response.ok) throw new Error('Failed to unban')
            const updated = await response.json()
            setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const confirmBan = async () => {
        if (!editingUser) return

        try {
            const response = await fetch(`/api/admin/users/${editingUser}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned: true, reason: banReason })
            })
            if (!response.ok) throw new Error('Failed to ban')
            const updated = await response.json()
            setUsers(users.map(u => u.id === editingUser ? { ...u, ...updated } : u))
            setShowBanModal(false)
            setBanReason('')
            setEditingUser(null)
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    // Auth Error Screen
    if (authError) {
        console.log('❌ Rendering Access Denied - authError is true')
        return (
            <div className="min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <LiquidCard className="max-w-md w-full">
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-400">Admin Access Required</h2>
                        <p className="text-gray-300 text-sm">You need to be logged in as an administrator to access this panel.</p>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                            <p><strong>Troubleshooting:</strong></p>
                            <p>• Ensure ADMIN_MODE is enabled on server</p>
                            <p>• Check browser console (F12) for API errors</p>
                            <p>• Try refreshing page (Ctrl+Shift+R)</p>
                        </div>
                    </div>
                </LiquidCard>
            </div>
        )
    }

    // Loading Screen
    if (loading) {
        console.log('⏳ Rendering Loading state')
        return (
            <div className="min-h-[50vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto"></div>
                    <p className="text-gray-400">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    console.log('✅ Rendering AdminPanel - users:', users.length, 'stats:', stats)

    const filteredUsers = users.filter(user => {
        const matchSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchFilter = filter === 'all' || user.accountType === filter
        return matchSearch && matchFilter
    })

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                    </div>
                    <p className="text-gray-400">Manage users and account types</p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-600 to-blue-700' },
                            { label: 'Consumers', value: stats.amateurs || 0, icon: Users, color: 'from-green-600 to-green-700' },
                            { label: 'Influencers', value: stats.influencers || 0, icon: Users, color: 'from-cyan-600 to-blue-700' },
                            { label: 'Producers', value: stats.producers || 0, icon: Users, color: 'from-purple-600 to-purple-700' },
                            { label: 'Banned', value: stats.bannedUsers || 0, icon: AlertCircle, color: 'from-red-600 to-red-700' }
                        ].map((stat, idx) => {
                            const Icon = stat.icon
                            return (
                                <LiquidCard key={idx} className="col-span-1">
                                    <div className="p-6 text-center space-y-2">
                                        <div className={`inline-block p-3 bg-gradient-to-br ${stat.color} rounded-full`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-3xl font-black text-white">{stat.value}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                </LiquidCard>
                            )
                        })}
                    </div>
                )}

                {/* Controls */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="all">All Account Types</option>
                                <option value="consumer">Consumer</option>
                                <option value="influencer">Influencer</option>
                                <option value="producer">Producer</option>
                            </select>
                            <LiquidButton
                                variant="primary"
                                size="sm"
                                onClick={fetchUsers}
                                icon={RefreshCw}
                                fullWidth
                            >
                                Refresh
                            </LiquidButton>
                        </div>
                    </div>
                </LiquidCard>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Producer Verifications */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-amber-400" />
                                Vérifications Producteur en attente ({verifications.length})
                            </h2>
                            <LiquidButton variant="secondary" size="sm" onClick={fetchVerifications} icon={RefreshCw}>
                                Rafraîchir
                            </LiquidButton>
                        </div>

                        {verificationsLoading ? (
                            <p className="text-gray-400 text-sm">Chargement...</p>
                        ) : verifications.length === 0 ? (
                            <p className="text-gray-400 text-sm">Aucune demande en attente.</p>
                        ) : (
                            <div className="space-y-3">
                                {verifications.map((v) => (
                                    <div key={v.id} className="p-4 bg-gray-800/60 border border-gray-700 rounded-lg space-y-3">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <p className="font-bold text-white">{v.companyName} <span className="text-xs text-gray-400 font-normal">({v.businessType})</span></p>
                                                <p className="text-xs text-gray-400">{v.username} · {v.email}</p>
                                                <p className="text-xs text-gray-400 mt-1">SIRET: {v.siret || '—'} · {v.country}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {v.verificationDoc && (
                                                    <a
                                                        href={v.verificationDoc}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> Document
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => reviewVerification(v.id, 'approve')}
                                                    className="px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 text-xs font-bold rounded-lg"
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => reviewVerification(v.id, 'reject')}
                                                    className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 text-xs font-bold rounded-lg"
                                                >
                                                    Rejeter
                                                </button>
                                            </div>
                                        </div>
                                        {v.sireneSnapshot && (
                                            <p className="text-xs text-gray-400">
                                                Sirene: {v.sireneSnapshot.found === true
                                                    ? `${v.sireneSnapshot.officialName || 'trouvé'} (${v.sireneSnapshot.active ? 'active' : 'fermée'})`
                                                    : v.sireneSnapshot.found === false
                                                        ? 'aucune entreprise trouvée'
                                                        : 'vérification indisponible'}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </LiquidCard>

                {/* Users Table */}
                {filteredUsers.length === 0 ? (
                    <LiquidCard>
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No users found</p>
                        </div>
                    </LiquidCard>
                ) : (
                    <div className="space-y-3">
                        {filteredUsers.map((user) => (
                            <LiquidCard key={user.id} className={user.isBanned ? 'opacity-75' : ''}>
                                <div className="p-4 md:p-6 space-y-4">
                                    {/* User Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-white truncate">{user.username}</h3>
                                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {user.isBanned && <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">BANNED</span>}
                                            {user.kycStatus === 'verified' && <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">KYC</span>}
                                        </div>
                                    </div>

                                    {/* Controls Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {/* Account Type */}
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400 uppercase tracking-wider">Account Type</label>
                                            <select
                                                value={user.accountType}
                                                onChange={(e) => changeAccountType(user.id, e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                            >
                                                <option value="consumer">Consumer</option>
                                                <option value="influencer">Influencer</option>
                                                <option value="producer">Producer</option>
                                            </select>
                                        </div>

                                        {/* Subscription Status */}
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400 uppercase tracking-wider">Subscription</label>
                                            {user.subscriptionType ? (
                                                <select
                                                    value={user.subscriptionStatus || 'none'}
                                                    onChange={(e) => changeSubscriptionStatus(user.id, e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="expired">Expired</option>
                                                </select>
                                            ) : (
                                                <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 text-sm">
                                                    None
                                                </div>
                                            )}
                                        </div>

                                        {/* Ban/Unban Button */}
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400 uppercase tracking-wider">Actions</label>
                                            <button
                                                onClick={() => toggleBan(user.id, user.isBanned)}
                                                className={`w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                                                    user.isBanned
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                                                }`}
                                            >
                                                {user.isBanned ? <Unlock className="w-4 h-4 inline mr-1" /> : <Lock className="w-4 h-4 inline mr-1" />}
                                                {user.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </LiquidCard>
                        ))}
                    </div>
                )}

                {/* Ban Modal */}
                {showBanModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <LiquidCard className="max-w-md w-full">
                            <div className="p-6 space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    Confirm Ban
                                </h3>
                                <textarea
                                    placeholder="Reason for ban (optional)..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                    rows="3"
                                />
                                <div className="flex gap-3">
                                    <LiquidButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowBanModal(false)}
                                        fullWidth
                                    >
                                        Cancel
                                    </LiquidButton>
                                    <LiquidButton
                                        variant="primary"
                                        size="sm"
                                        onClick={confirmBan}
                                        fullWidth
                                    >
                                        Confirm Ban
                                    </LiquidButton>
                                </div>
                            </div>
                        </LiquidCard>
                    </div>
                )}
            </div>
        </div>
    )
}

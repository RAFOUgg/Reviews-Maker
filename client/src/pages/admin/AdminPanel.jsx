import React, { useState, useEffect } from 'react'
import './AdminPanel.css'

export default function AdminPanel() {
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

    useEffect(() => {
        console.log('🔧 AdminPanel useEffect - checking auth...')
        console.log('🔧 ADMIN_MODE check starting...')
        checkAuth()
        fetchUsers()
        fetchStats()
    }, [])

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
            setLoading(true)
            const response = await fetch('/api/admin/users')
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            const data = await response.json()
            setUsers(data.users)
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
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

    const filteredUsers = users.filter(user => {
        const matchSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchFilter = filter === 'all' || user.accountType === filter
        return matchSearch && matchFilter
    })

    if (authError) {
        console.log('❌ Rendering Access Denied - authError is true')
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                padding: '2rem'
            }}>
                <div style={{
                    background: '#0f3460',
                    border: '2px solid #e94560',
                    padding: '3rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(233, 69, 96, 0.3)',
                    maxWidth: '500px'
                }}>
                    <h2 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '1.8rem' }}>🔐 Admin Access Required</h2>
                    <p style={{ color: '#e0e0e0', fontSize: '1.05rem' }}>You need to be logged in as an administrator to access this panel.</p>
                    <p style={{ fontSize: '0.95em', marginTop: '1.5rem', lineHeight: '1.6', color: '#e0e0e0' }}>
                        <strong>Troubleshooting:</strong><br/>
                        • Ensure ADMIN_MODE is enabled on the server<br/>
                        • Check browser console (F12) for API errors<br/>
                        • Try refreshing the page (Ctrl+Shift+R)
                    </p>
                    <div style={{ 
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        fontSize: '0.85em',
                        color: '#e0e0e0'
                    }}>
                        <p style={{ margin: 0, opacity: 0.8 }}>API Response: Not authenticated or ADMIN_MODE not set</p>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        console.log('⏳ Rendering Loading state')
        return (
            <div className="admin-panel">
                <div className="admin-header">
                    <h1>Admin Panel</h1>
                    <p>Loading...</p>
                </div>
                <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading admin panel...
                </div>
            </div>
        )
    }

    console.log('✅ Rendering AdminPanel - users:', users.length, 'stats:', stats)

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <p>Manage users and account types</p>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{stats.totalUsers}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.amateurs}</div>
                        <div className="stat-label">Consumers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.influencers}</div>
                        <div className="stat-label">Influencers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.producers}</div>
                        <div className="stat-label">Producers</div>
                    </div>
                    <div className="stat-card banned">
                        <div className="stat-number">{stats.bannedUsers}</div>
                        <div className="stat-label">Banned</div>
                    </div>
                </div>
            )}

            <div className="admin-controls">
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Account Types</option>
                    <option value="consumer">Consumer</option>
                    <option value="influencer">Influencer</option>
                    <option value="producer">Producer</option>
                </select>
                <button onClick={fetchUsers} className="refresh-btn">
                    Refresh
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {!stats && !loading && (
                <div style={{ 
                    padding: '2rem', 
                    backgroundColor: 'rgba(255,165,0,0.1)', 
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#ff9500'
                }}>
                    <p>Failed to load admin data. User may not have admin permissions.</p>
                    <p style={{ fontSize: '0.9em', marginTop: '0.5rem' }}>Check console (F12) for API errors.</p>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Account Type</th>
                                <th>Subscription</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={user.isBanned ? 'banned-user' : ''}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <select
                                                value={user.accountType}
                                                onChange={(e) =>
                                                    changeAccountType(user.id, e.target.value)
                                                }
                                                className="type-select"
                                            >
                                                <option value="consumer">Consumer [C]</option>
                                                <option value="influencer">
                                                    Influencer [I]
                                                </option>
                                                <option value="producer">Producer [P]</option>
                                            </select>
                                        </td>
                                        <td>
                                            {user.subscriptionType ? (
                                                <select
                                                    value={user.subscriptionStatus}
                                                    onChange={(e) =>
                                                        changeSubscriptionStatus(
                                                            user.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="status-select"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="cancelled">
                                                        Cancelled
                                                    </option>
                                                    <option value="expired">Expired</option>
                                                </select>
                                            ) : (
                                                <span className="no-sub">None</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="status-badges">
                                                {user.isBanned && (
                                                    <span className="badge banned">BANNED</span>
                                                )}
                                                {user.kycStatus === 'verified' && (
                                                    <span className="badge verified">KYC</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    toggleBan(user.id, user.isBanned)
                                                }
                                                className={`action-btn ${
                                                    user.isBanned ? 'unban' : 'ban'
                                                }`}
                                            >
                                                {user.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showBanModal && (
                <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Ban User</h3>
                        <textarea
                            placeholder="Reason for ban (optional)..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="ban-reason-input"
                        />
                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowBanModal(false)}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                            <button onClick={confirmBan} className="btn-confirm">
                                Confirm Ban
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

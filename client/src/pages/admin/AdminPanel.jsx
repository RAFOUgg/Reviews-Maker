import React, { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import './AdminPanel.css'

export default function AdminPanel() {
    const navigate = useNavigate()
    const { user } = useStore()
    const [isAdmin, setIsAdmin] = useState(false)
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [filter, setFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        checkAdminAccess()
    }, [])

    const checkAdminAccess = async () => {
        try {
            const response = await fetch('/api/admin/check-auth')
            const data = await response.json()
            if (data.isAdmin) {
                setIsAdmin(true)
                loadUsers()
                loadStats()
            } else {
                navigate('/account')
            }
        } catch (error) {
            console.error('Failed to check admin access:', error)
            navigate('/account')
        }
    }

    const loadUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            const data = await response.json()
            setUsers(data.users)
        } catch (error) {
            console.error('Failed to load users:', error)
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch('/api/admin/stats')
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateAccountType = async (userId, accountType) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/account-type`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountType })
            })
            const data = await response.json()
            if (response.ok) {
                loadUsers()
                alert(`✅ Account type changed to ${accountType}`)
            } else {
                alert(`❌ Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Failed to update account type:', error)
            alert('Failed to update account type')
        }
    }

    const updateSubscription = async (userId, subscriptionStatus) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/subscription`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionStatus })
            })
            const data = await response.json()
            if (response.ok) {
                loadUsers()
                alert(`✅ Subscription updated to ${subscriptionStatus}`)
            } else {
                alert(`❌ Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Failed to update subscription:', error)
            alert('Failed to update subscription')
        }
    }

    const banUser = async (userId, banned) => {
        try {
            const reason = banned ? prompt('Ban reason:') : null
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned, reason })
            })
            const data = await response.json()
            if (response.ok) {
                loadUsers()
                alert(`✅ User ${banned ? 'banned' : 'unbanned'}`)
            } else {
                alert(`❌ Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Failed to ban user:', error)
            alert('Failed to ban user')
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesFilter = filter === 'all' || u.accountType === filter
        const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesFilter && matchesSearch
    })

    if (loading) {
        return <div className="admin-panel"><p>⏳ Loading...</p></div>
    }

    if (!isAdmin) {
        return <div className="admin-panel"><p>❌ Access Denied</p></div>
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>🔐 Admin Panel</h1>
                <p>Manage users and system settings</p>
            </div>

            {/* Stats Section */}
            {stats && (
                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.amateurs}</div>
                        <div className="stat-label">Amateur</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.influencers}</div>
                        <div className="stat-label">Influencer</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.producers}</div>
                        <div className="stat-label">Producer</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.bannedUsers}</div>
                        <div className="stat-label">Banned</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalReviews}</div>
                        <div className="stat-label">Reviews</div>
                    </div>
                </div>
            )}

            {/* Users Management */}
            <div className="admin-section">
                <h2>👥 User Management</h2>

                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search"
                    />
                    <div className="filter-buttons">
                        {['all', 'consumer', 'influencer', 'producer'].map(type => (
                            <button
                                key={type}
                                className={`filter-btn ${filter === type ? 'active' : ''}`}
                                onClick={() => setFilter(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Account Type</th>
                                <th>Subscription</th>
                                <th>KYC Status</th>
                                <th>Banned</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id} className={u.isBanned ? 'banned-user' : ''}>
                                    <td><strong>{u.username}</strong></td>
                                    <td>{u.email || 'N/A'}</td>
                                    <td>
                                        <div className="account-type-badge">
                                            {u.accountType}
                                            <div className="quick-change">
                                                {['consumer', 'influencer', 'producer'].map(type => (
                                                    <button
                                                        key={type}
                                                        className={`quick-btn ${u.accountType === type ? 'selected' : ''}`}
                                                        onClick={() => updateAccountType(u.id, type)}
                                                        title={`Change to ${type}`}
                                                    >
                                                        {type[0].toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            value={u.subscriptionStatus || 'inactive'}
                                            onChange={(e) => updateSubscription(u.id, e.target.value)}
                                            className="subscription-select"
                                        >
                                            <option value="inactive">Inactive</option>
                                            <option value="active">Active</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`kyc-status ${u.kycStatus || 'none'}`}>
                                            {u.kycStatus || 'None'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={u.isBanned ? 'banned-badge' : 'active-badge'}>
                                            {u.isBanned ? '🚫 Banned' : '✅ Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="ban-btn"
                                            onClick={() => banUser(u.id, !u.isBanned)}
                                            title={u.isBanned ? 'Unban' : 'Ban'}
                                        >
                                            {u.isBanned ? '🔓' : '🔒'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

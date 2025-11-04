import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import CreateReviewPage from './pages/CreateReviewPage'
import AuthCallback from './components/AuthCallback'
import { useStore } from './store/useStore'

function App() {
    const setUser = useStore((state) => state.setUser)

    // ✅ Vérifier la session au démarrage
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include' // ✅ Important pour envoyer les cookies
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                    console.log('✅ Session restaurée:', userData.username)
                } else {
                    console.log('No session found - user not authenticated')
                }
            } catch (error) {
                console.error('Session check failed:', error)
            }
        }

        checkSession()
    }, [setUser])

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text">
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/review/:id" element={<ReviewDetailPage />} />
                    <Route path="/create" element={<CreateReviewPage />} />
                </Route>
                <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
        </div>
    )
}

export default App

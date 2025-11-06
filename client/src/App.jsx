import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import CreateReviewPage from './pages/CreateReviewPage'
import EditReviewPage from './pages/EditReviewPage'
import LibraryPage from './pages/LibraryPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AuthCallback from './components/AuthCallback'
import ToastContainer from './components/ToastContainer'
import { useStore } from './store/useStore'

function App() {
    const setUser = useStore((state) => state.setUser)

    // ✅ Appliquer le thème au démarrage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'violet-lean'
        const root = window.document.documentElement

        const applyTheme = (themeValue) => {
            root.removeAttribute('data-theme')

            switch (themeValue) {
                case 'violet-lean':
                    root.setAttribute('data-theme', 'violet-lean')
                    root.classList.remove('dark')
                    break
                case 'emerald':
                    root.setAttribute('data-theme', 'emerald')
                    root.classList.remove('dark')
                    break
                case 'tahiti':
                    root.setAttribute('data-theme', 'tahiti')
                    root.classList.remove('dark')
                    break
                case 'rose-vif':
                    root.setAttribute('data-theme', 'rose-vif')
                    root.classList.remove('dark')
                    break
                case 'dark':
                    root.setAttribute('data-theme', 'dark')
                    root.classList.add('dark')
                    break
                case 'auto':
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                    if (isDark) {
                        root.setAttribute('data-theme', 'dark')
                        root.classList.add('dark')
                    } else {
                        root.setAttribute('data-theme', 'violet-lean')
                        root.classList.remove('dark')
                    }
                    break
                default:
                    root.setAttribute('data-theme', 'violet-lean')
            }
        }

        applyTheme(savedTheme)
    }, [])

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
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/review/:id" element={<ReviewDetailPage />} />
                    <Route path="/create" element={<CreateReviewPage />} />
                    <Route path="/edit/:id" element={<EditReviewPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
        </div>
    )
}

export default App

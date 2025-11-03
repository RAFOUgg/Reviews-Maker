import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import CreateReviewPage from './pages/CreateReviewPage'

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/review/:id" element={<ReviewDetailPage />} />
          <Route path="/create" element={<CreateReviewPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App

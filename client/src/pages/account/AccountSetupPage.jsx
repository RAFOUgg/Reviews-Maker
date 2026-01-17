import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AccountSetupPage() {
    const navigate = useNavigate()
    
    useEffect(() => {
        navigate('/account', { replace: true })
    }, [navigate])
    
    return <div className="hidden" />
}

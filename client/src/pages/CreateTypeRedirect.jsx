import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

/**
 * Redirecteur pour /create/type/:type
 * Redirige vers le bon composant selon le type
 */
export default function CreateTypeRedirect() {
    const navigate = useNavigate()
    const { type } = useParams()

    useEffect(() => {
        if (type === 'Fleur') {
            navigate('/create/flower', { replace: true })
        } else if (type === 'Hash') {
            navigate('/create?type=Hash', { replace: true })
        } else if (type === 'Concentré') {
            navigate('/create?type=Concentré', { replace: true })
        } else if (type === 'Comestible') {
            navigate('/create?type=Comestible', { replace: true })
        } else {
            navigate('/create', { replace: true })
        }
    }, [type, navigate])

    return null
}

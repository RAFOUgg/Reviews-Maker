/**
 * ErrorBoundary - Composant d'erreur amélioré avec Coming Soon
 * Affiche un message professionnel avec logs debug
 */
import { Component } from 'react'
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null,
            showDebug: false
        }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        }

        return this.props.children
    }
}


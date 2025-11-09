/**
 * Composant ErrorBoundary pour attraper les erreurs React
 */
import { Component } from 'react'
import Button from './Button'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
                    <div className="max-w-md w-full bg-dark-surface rounded-2xl p-8 border border-dark-border">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-dark-text mb-2">
                                Oops! Une erreur est survenue
                            </h1>
                            <p className="text-dark-muted">
                                Quelque chose s'est mal passé. Veuillez réessayer.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <summary className="cursor-pointer text-sm font-semibold text-red-400 mb-2">
                                    Détails de l'erreur (dev)
                                </summary>
                                <pre className="text-xs text-red-300 overflow-auto max-h-48">
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => window.history.back()}
                                variant="secondary"
                                className="flex-1"
                            >
                                ← Retour
                            </Button>
                            <Button
                                onClick={this.handleReset}
                                variant="primary"
                                className="flex-1"
                            >
                                🔄 Recharger
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

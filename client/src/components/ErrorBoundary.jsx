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
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null, showDebug: false })
        window.location.reload()
    }

    toggleDebug = () => {
        this.setState(prev => ({ showDebug: !prev.showDebug }))
    }

    getErrorInfo = () => {
        const { error } = this.state
        if (!error) return {}
        
        const message = error.message || String(error)
        const stack = error.stack || ''
        const match = stack.match(/at\s+(\w+)\s+\((.*?):(\d+):(\d+)\)/) || []
        
        return {
            message,
            function: match[1] || 'Unknown',
            file: match[2] ? match[2].split('/').pop() : 'Unknown',
            line: match[3] || '?',
            column: match[4] || '?'
        }
    }

    render() {
        if (this.state.hasError) {
            const isDev = process.env.NODE_ENV === 'development'
            const errorInfo = this.getErrorInfo()

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
                    <div className="max-w-lg w-full">
                        {/* Main Card */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-xl p-8 space-y-6">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                                    <AlertTriangle className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            {/* Coming Soon Message */}
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold text-white">
                                    Fonctionnalité en développement
                                </h1>
                                <p className="text-gray-300 text-sm">
                                    Cette section est en cours de mise à jour et sera disponible très bientôt.
                                </p>
                            </div>

                            {/* Status Info */}
                            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-2">
                                <p className="text-xs text-gray-400 font-semibold">📋 STATUT</p>
                                <p className="text-gray-200 text-sm">
                                    En cours de développement et de finalisation
                                </p>
                            </div>

                            {/* Debug Info (Dev Only) */}
                            {isDev && errorInfo.message && (
                                <div className="space-y-3">
                                    <button
                                        onClick={this.toggleDebug}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-red-900/20 border border-red-700/50 rounded-lg hover:bg-red-900/30 transition-colors"
                                    >
                                        <span className="text-xs text-red-400 font-semibold">🐛 DEBUG INFO</span>
                                        <ChevronDown className={`w-4 h-4 text-red-400 transition-transform ${this.state.showDebug ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {this.state.showDebug && (
                                        <div className="bg-red-900/10 border border-red-700/50 rounded-lg p-4 space-y-2 max-h-64 overflow-auto">
                                            <div className="font-mono text-xs text-red-300 space-y-2">
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 min-w-[80px]">Error:</span>
                                                    <span className="flex-1 break-words">{errorInfo.message}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 min-w-[80px]">Function:</span>
                                                    <span className="flex-1">{errorInfo.function}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 min-w-[80px]">File:</span>
                                                    <span className="flex-1">{errorInfo.file}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 min-w-[80px]">Location:</span>
                                                    <span className="flex-1">{errorInfo.line}:{errorInfo.column}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Réessayer
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all active:scale-95"
                                >
                                    Accueil
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-700 text-center">
                                <p className="text-xs text-gray-500">
                                    Les équipes travaillent à la finalisation de cette fonctionnalité.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}


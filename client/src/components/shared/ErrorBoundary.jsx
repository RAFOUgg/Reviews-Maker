/**
 * ErrorBoundary - Composant d'erreur amélioré
 * Liquid Glass UI Design System
 */
import { Component } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDebug: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null, showDebug: false });
        window.location.reload();
    };

    toggleDebug = () => {
        this.setState(prev => ({ showDebug: !prev.showDebug }));
    };

    getErrorInfo = () => {
        const { error } = this.state;
        if (!error) return {};

        const message = error.message || String(error);
        const stack = error.stack || '';
        const match = stack.match(/at\s+(\w+)\s+\((.*?):(\d+):(\d+)\)/) || [];

        return {
            message,
            function: match[1] || 'Unknown',
            file: match[2] ? match[2].split('/').pop() : 'Unknown',
            line: match[3] || '?',
            column: match[4] || '?'
        };
    };

    render() {
        if (this.state.hasError) {
            const isDev = process.env.NODE_ENV === 'development';
            const errorInfo = this.getErrorInfo();

            return (
                <div className="min-h-screen flex items-center justify-center bg-[#07070f] p-4">
                    <div className="max-w-lg w-full">
                        {/* Main Card */}
                        <div
                            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-8 space-y-6"
                            style={{ boxShadow: '0 0 40px rgba(245, 158, 11, 0.15)' }}
                        >
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div
                                    className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30"
                                    style={{ boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)' }}
                                >
                                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                                </div>
                            </div>

                            {/* Coming Soon Message */}
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold text-white">
                                    Fonctionnalité en développement
                                </h1>
                                <p className="text-white/60 text-sm">
                                    Cette section est en cours de mise à jour et sera disponible très bientôt.
                                </p>
                            </div>

                            {/* Status Info */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                                <p className="text-xs text-white/40 font-semibold">📋 STATUT</p>
                                <p className="text-white/80 text-sm">
                                    En cours de développement et de finalisation
                                </p>
                            </div>

                            {/* Debug Info (Dev Only) */}
                            {isDev && errorInfo.message && (
                                <div className="space-y-3">
                                    <button
                                        onClick={this.toggleDebug}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
                                    >
                                        <span className="text-xs text-red-400 font-semibold">🐛 DEBUG INFO</span>
                                        <ChevronDown className={`w-4 h-4 text-red-400 transition-transform ${this.state.showDebug ? 'rotate-180' : ''}`} />
                                    </button>

                                    {this.state.showDebug && (
                                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2 max-h-64 overflow-auto">
                                            <div className="font-mono text-xs text-red-300 space-y-2">
                                                <div className="flex gap-2">
                                                    <span className="text-white/40 min-w-[80px]">Error:</span>
                                                    <span className="flex-1 break-words">{errorInfo.message}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-white/40 min-w-[80px]">Function:</span>
                                                    <span className="flex-1">{errorInfo.function}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-white/40 min-w-[80px]">File:</span>
                                                    <span className="flex-1">{errorInfo.file}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-white/40 min-w-[80px]">Location:</span>
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
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-500/20 border border-violet-500/50 hover:bg-violet-500/30 text-white font-semibold rounded-xl transition-all active:scale-95"
                                    style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' }}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Réessayer
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-semibold rounded-xl transition-all active:scale-95"
                                >
                                    <Home className="w-4 h-4" />
                                    Accueil
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-white/10 text-center">
                                <p className="text-xs text-white/40">
                                    Les équipes travaillent à la finalisation de cette fonctionnalité.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}




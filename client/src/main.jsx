import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Defensive global for older cached bundles that may reference REPEAT_COUNT
// Ensure a default to avoid ReferenceError in older builds still loaded in the client
if (typeof globalThis !== 'undefined') {
    globalThis.REPEAT_COUNT = globalThis.REPEAT_COUNT || 1;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)

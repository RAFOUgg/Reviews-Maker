import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver (utilisé pour le canvas scaling)
global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
}))

// Mock ResizeObserver (utilisé pour le responsive canvas)
global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
}))

// Mock fetch global pour les API calls
global.fetch = vi.fn()

// Mock HTML5 Canvas API (pour les exports)
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn()
}))

// Mock toDataURL pour canvas
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mockedImageData')

// Mock pour localStorage (orchardStore persistence)
const localStorageMock = {
    getItem: vi.fn((key) => {
        return localStorage._storage[key] || null
    }),
    setItem: vi.fn((key, value) => {
        localStorage._storage[key] = value
    }),
    removeItem: vi.fn((key) => {
        delete localStorage._storage[key]
    }),
    clear: vi.fn(() => {
        localStorage._storage = {}
    }),
    _storage: {}
}

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock pour URL.createObjectURL (utilisé pour les téléchargements)
global.URL.createObjectURL = vi.fn(() => 'mocked-blob-url')
global.URL.revokeObjectURL = vi.fn()

// Mock pour window.open (utilisé parfois pour les exports)
window.open = vi.fn()

// Cleanup après chaque test
afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
})
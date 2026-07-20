/**
 * Service API centralisé pour les reviews
 * Gère tous les appels API liés aux reviews avec retry logic et error handling
 */

const API_BASE = '/api'

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class APIError extends Error {
    constructor(message, statusCode, code) {
        super(message)
        this.name = 'APIError'
        this.statusCode = statusCode
        this.code = code
    }
}

/**
 * Service pour les opérations de compte (upgrade/downgrade)
 */
export const accountService = {
    async changeType(newType, options = {}) {
        return fetchAPI(`${API_BASE}/account/change-type`, {
            method: 'POST',
            body: JSON.stringify({ newType, options })
        })
    },

    async getInfo() {
        return fetchAPI(`${API_BASE}/account/info`)
    }
}

/**
 * Réglages du compte : préférences d'usage et sessions de connexion.
 */
export const settingsService = {
    async getPreferences() {
        return fetchAPI(`${API_BASE}/user/settings/preferences`)
    },

    /** Accepte un objet partiel : seules les clés fournies sont modifiées. */
    async updatePreferences(patch) {
        return fetchAPI(`${API_BASE}/user/settings/preferences`, {
            method: 'PUT',
            body: JSON.stringify(patch)
        })
    },

    async getSessions() {
        return fetchAPI(`${API_BASE}/user/settings/sessions`)
    },

    async revokeSession(id) {
        return fetchAPI(`${API_BASE}/user/settings/sessions/${id}`, { method: 'DELETE' })
    },

    async revokeOtherSessions() {
        return fetchAPI(`${API_BASE}/user/settings/sessions/revoke-others`, { method: 'POST' })
    }
}

/**
 * Service entreprise / sous-comptes employés.
 * Les droits (`canManageMembers`, `myRole`) sont décidés et renvoyés par le serveur.
 */
export const companyService = {
    async me() {
        return fetchAPI(`${API_BASE}/company/me`)
    },

    async invite(email, role) {
        return fetchAPI(`${API_BASE}/company/members/invite`, {
            method: 'POST',
            body: JSON.stringify({ email, role })
        })
    },

    async getInvite(token) {
        return fetchAPI(`${API_BASE}/company/invite/${token}`)
    },

    async acceptInvite(token) {
        return fetchAPI(`${API_BASE}/company/invite/${token}/accept`, { method: 'POST' })
    },

    async updateMember(memberId, role) {
        return fetchAPI(`${API_BASE}/company/members/${memberId}`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        })
    },

    async removeMember(memberId) {
        return fetchAPI(`${API_BASE}/company/members/${memberId}`, { method: 'DELETE' })
    },

    async leave() {
        return fetchAPI(`${API_BASE}/company/leave`, { method: 'POST' })
    }
}

/**
 * Service abonnement (PayPal Subscriptions).
 *
 * Il n'existe volontairement aucune méthode capable d'accorder un tier payant : le droit d'accès est
 * décidé côté serveur d'après l'état renvoyé par PayPal. `activate` ne fait que soumettre à
 * vérification l'identifiant d'abonnement produit par le popup PayPal.
 */
export const paymentService = {
    /** Client id public + ids de plans, pour initialiser le SDK PayPal côté navigateur. */
    async config() {
        return fetchAPI(`${API_BASE}/payment/config`)
    },

    async activate(subscriptionId) {
        return fetchAPI(`${API_BASE}/payment/subscription/activate`, {
            method: 'POST',
            body: JSON.stringify({ subscriptionId })
        })
    },

    async cancel() {
        return fetchAPI(`${API_BASE}/payment/subscription/cancel`, {
            method: 'POST'
        })
    },

    /** Resynchronise depuis PayPal si un webhook a été manqué. */
    async refresh() {
        return fetchAPI(`${API_BASE}/payment/subscription/refresh`, {
            method: 'POST'
        })
    },

    async status() {
        return fetchAPI(`${API_BASE}/payment/status`)
    }
}

/**
 * Types de produits et leurs routes correspondantes
 */
export const PRODUCT_TYPES = {
    Fleurs: 'flower',
    Hash: 'hash',
    Concentré: 'concentrate',
    Comestible: 'edible'
}

/**
 * Wrapper fetch avec gestion d'erreurs
 */
async function fetchAPI(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    }

    // Ne pas ajouter Content-Type pour FormData
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type']
    }

    const response = await fetch(url, { ...defaultOptions, ...options })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'unknown', message: 'An error occurred' }))
        throw new APIError(
            error.message || error.error || 'Request failed',
            response.status,
            error.error || 'unknown'
        )
    }

    return response.json()
}

/**
 * Service pour les opérations sur les reviews
 */
export const reviewsService = {
    /**
     * Récupérer toutes les reviews
     */
    async getAll(filters = {}) {
        const params = new URLSearchParams()
        if (filters.type) params.append('type', filters.type)
        if (filters.search) params.append('search', filters.search)
        if (filters.sortBy) params.append('sortBy', filters.sortBy)
        if (filters.order) params.append('order', filters.order)

        const url = `${API_BASE}/reviews${params.toString() ? `?${params}` : ''}`
        return fetchAPI(url)
    },

    /**
     * Récupérer les reviews de l'utilisateur connecté
     */
    async getMy() {
        return fetchAPI(`${API_BASE}/reviews/my`)
    },

    /**
     * Récupérer une review par ID
     */
    async getById(id) {
        return fetchAPI(`${API_BASE}/reviews/${id}`)
    },

    /**
     * Créer une nouvelle review
     */
    async create(formData) {
        return fetchAPI(`${API_BASE}/reviews`, {
            method: 'POST',
            body: formData // FormData
        })
    },

    /**
     * Mettre à jour une review
     */
    async update(id, formData) {
        return fetchAPI(`${API_BASE}/reviews/${id}`, {
            method: 'PUT',
            body: formData // FormData
        })
    },

    /**
     * Supprimer une review
     */
    async delete(id) {
        return fetchAPI(`${API_BASE}/reviews/${id}`, {
            method: 'DELETE'
        })
    },

    /**
     * Définir l'image d'aperçu galerie (thumbnail capturé depuis OrchardPanel)
     */
    async setPreview(id, previewDataUrl) {
        return fetchAPI(`${API_BASE}/reviews/${id}/preview`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ previewDataUrl })
        })
    },

    /**
     * Changer la visibilité d'une review
     */
    async updateVisibility(id, isPublic) {
        return fetchAPI(`${API_BASE}/reviews/${id}/visibility`, {
            method: 'PATCH',
            body: JSON.stringify({ isPublic })
        })
    },

    /**
     * Liker une review
     */
    async like(id) {
        return fetchAPI(`${API_BASE}/reviews/${id}/like`, {
            method: 'POST'
        })
    },

    /**
     * Disliker une review
     */
    async dislike(id) {
        return fetchAPI(`${API_BASE}/reviews/${id}/dislike`, {
            method: 'POST'
        })
    },

    /**
     * Obtenir les stats de likes/dislikes
     */
    async getLikes(id) {
        return fetchAPI(`${API_BASE}/reviews/${id}/likes`)
    }
}

/**
 * Service pour les reviews Fleurs
 */
export const flowerReviewsService = {
    /**
     * Créer une review Fleur
     * @param {FormData} formData - Données du formulaire avec images
     */
    async create(formData) {
        return fetchAPI(`${API_BASE}/flower-reviews`, {
            method: 'POST',
            body: formData
        })
    },

    /**
     * Mettre à jour une review Fleur
     */
    async update(id, formData) {
        return fetchAPI(`${API_BASE}/flower-reviews/${id}`, {
            method: 'PUT',
            body: formData
        })
    },

    /**
     * Récupérer une review Fleur par ID
     */
    async getById(id) {
        return fetchAPI(`${API_BASE}/flower-reviews/${id}`)
    },

    /**
     * Sauvegarder un brouillon
     */
    async saveDraft(formData) {
        const reviewData = {
            ...formData,
            status: 'draft'
        }
        return fetchAPI(`${API_BASE}/flower-reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Service pour les reviews Hash
 */
export const hashReviewsService = {
    async create(formData) {
        return fetchAPI(`${API_BASE}/hash-reviews`, {
            method: 'POST',
            body: formData
        })
    },

    async update(id, formData) {
        return fetchAPI(`${API_BASE}/hash-reviews/${id}`, {
            method: 'PUT',
            body: formData
        })
    },

    async getById(id) {
        return fetchAPI(`${API_BASE}/hash-reviews/${id}`)
    }
}

/**
 * Service pour les reviews Concentrés
 */
export const concentrateReviewsService = {
    async create(formData) {
        return fetchAPI(`${API_BASE}/concentrate-reviews`, {
            method: 'POST',
            body: formData
        })
    },

    async update(id, formData) {
        return fetchAPI(`${API_BASE}/concentrate-reviews/${id}`, {
            method: 'PUT',
            body: formData
        })
    },

    async getById(id) {
        return fetchAPI(`${API_BASE}/concentrate-reviews/${id}`)
    }
}

/**
 * Service pour les reviews Comestibles
 */
export const edibleReviewsService = {
    async create(formData) {
        return fetchAPI(`${API_BASE}/edible-reviews`, {
            method: 'POST',
            body: formData
        })
    },

    async update(id, formData) {
        return fetchAPI(`${API_BASE}/edible-reviews/${id}`, {
            method: 'PUT',
            body: formData
        })
    },

    async getById(id) {
        return fetchAPI(`${API_BASE}/edible-reviews/${id}`)
    }
}

/**
 * Service pour l'authentification
 */
export const authService = {
    /**
     * Récupérer l'utilisateur connecté
     */
    async getMe() {
        return fetchAPI(`${API_BASE}/auth/me`)
    },

    /**
     * Créer un compte email/mot de passe
     */
    async signupWithEmail(payload) {
        return fetchAPI(`${API_BASE}/auth/email/signup`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    /**
     * Connexion email/mot de passe
     */
    async loginWithEmail(payload) {
        return fetchAPI(`${API_BASE}/auth/email/login`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    /**
     * Deuxième étape du login si la 2FA TOTP est activée
     */
    async loginWithTotp(payload) {
        return fetchAPI(`${API_BASE}/auth/email/login/totp`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },

    /**
     * Se déconnecter
     */
    async logout() {
        return fetchAPI(`${API_BASE}/auth/logout`, {
            method: 'POST'
        })
    },

    /**
     * Rediriger vers Discord OAuth
     */
    loginWithDiscord() {
        window.location.href = `${API_BASE}/auth/discord`
    }
}

/**
 * Service pour les templates d'export
 */
export const templatesService = {
    /**
     * Créer un nouveau template
     * @param {object} templateData - Données du template { name, description, isPublic, config }
     */
    async create(templateData) {
        return fetchAPI(`${API_BASE}/templates`, {
            method: 'POST',
            body: JSON.stringify(templateData)
        });
    }
};

/**
 * Service pour les utilisateurs
 */
export const usersService = {
    /**
     * Récupérer les reviews de l'utilisateur connecté
     */
    async getMyReviews() {
        return fetchAPI(`${API_BASE}/users/me/reviews`)
    },

    /**
     * Récupérer les statistiques de l'utilisateur connecté
     */
    async getMyStats() {
        return fetchAPI(`${API_BASE}/users/me/stats`)
    },

    /**
     * Récupérer le profil public d'un utilisateur
     */
    async getProfile(userId) {
        return fetchAPI(`${API_BASE}/users/${userId}/profile`)
    },

    /**
     * Récupérer les reviews publiques d'un utilisateur
     */
    async getUserReviews(userId) {
        return fetchAPI(`${API_BASE}/users/${userId}/reviews`)
    },

    /**
     * Mettre à jour les informations légales (âge, pays)
     */
    async updateLegalInfo(data) {
        return fetchAPI(`${API_BASE}/users/update-legal-info`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    /**
     * Accepter le disclaimer RDR
     */
    async acceptRDR(data) {
        return fetchAPI(`${API_BASE}/users/accept-rdr`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }
}

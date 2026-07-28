// Les images stockées en base peuvent être de simples noms de fichier (ex: "flower-123.png")
// plutôt que des URLs complètes. Sans préfixe, le navigateur les résout comme un chemin
// relatif à la page courante (ex: /edit/flower/flower-123.png) au lieu de /images/flower-123.png
export function resolveImageUrl(url) {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/')) return url;
    return `/images/${url}`;
}

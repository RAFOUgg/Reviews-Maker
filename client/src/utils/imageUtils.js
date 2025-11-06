// API Base URL configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

/**
 * Convert a filename or path to a full image URL
 * @param {string|null} imagePath - The image filename or path
 * @returns {string} The full URL to the image
 */
export function getImageUrl(imagePath) {
    if (!imagePath) return '/placeholder-image.jpg'; // Fallback image

    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it starts with /images, just prepend API_BASE
    if (imagePath.startsWith('/images/')) {
        return `${API_BASE}${imagePath}`;
    }

    // Otherwise, assume it's just a filename
    return `${API_BASE}/images/${imagePath}`;
}

/**
 * Parse images field from review data
 * @param {string|array} images - The images field from the database
 * @returns {array} Array of image URLs
 */
export function parseImages(images) {
    let imageArray = [];

    if (typeof images === 'string') {
        try {
            imageArray = JSON.parse(images);
        } catch {
            imageArray = [];
        }
    } else if (Array.isArray(images)) {
        imageArray = images;
    }

    // Convert all filenames to full URLs
    return imageArray.map(getImageUrl);
}

/**
 * Get main image URL from review
 * @param {object} review - The review object
 * @returns {string} The main image URL
 */
export function getMainImageUrl(review) {
    if (review.mainImage) {
        return getImageUrl(review.mainImage);
    }

    // Fallback to first image in array
    const images = parseImages(review.images);
    return images.length > 0 ? images[0] : '/placeholder-image.jpg';
}

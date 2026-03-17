/**
 * Fast Shopping — Unsplash Image Service
 * Fetches high-quality product images from Unsplash
 * Falls back to placeholder if API key not set
 */

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE = 'https://api.unsplash.com';

// Category → Unsplash search keyword map
const CATEGORY_QUERIES = {
    'Electronics': 'electronics gadgets tech',
    'Mobiles': 'smartphone mobile phone',
    'Fashion': 'fashion clothing apparel',
    'Home & Kitchen': 'kitchen home interior',
    'Appliances': 'home appliances',
    'Books': 'books reading library',
    'Gaming': 'gaming console controller',
    'Audio': 'headphones speaker audio',
    'Sports': 'sports fitness workout',
    'Furniture': 'furniture interior design',
    'Toys': 'toys children play',
    'Grocery': 'food grocery fresh',
    'Beauty': 'beauty cosmetics skincare',
    'Footwear': 'shoes footwear sneakers',
    'Watches': 'watch luxury wristwatch',
};

/**
 * Get product image from Unsplash
 * @param {string} query - search term
 * @param {string} category - product category
 * @param {number} width - image width (default 400)
 */
export const getProductImage = async (query, category = '', width = 400) => {
    if (!UNSPLASH_KEY || UNSPLASH_KEY === 'your_unsplash_access_key_here') {
        // Return a deterministic placeholder with the product name
        return `https://source.unsplash.com/featured/${width}x${width}/?${encodeURIComponent(query || category)}`;
    }

    const searchQuery = query || CATEGORY_QUERIES[category] || category;

    try {
        const res = await fetch(
            `${BASE}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=squarish`,
            { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }
    } catch (err) {
        console.warn('Unsplash fetch failed', err);
    }

    return `https://source.unsplash.com/featured/${width}x${width}/?${encodeURIComponent(searchQuery)}`;
};

/**
 * Get multiple images for a category (for home page banners)
 * @param {string} category
 * @param {number} count
 */
export const getCategoryImages = async (category, count = 4) => {
    const query = CATEGORY_QUERIES[category] || category;

    if (!UNSPLASH_KEY || UNSPLASH_KEY === 'your_unsplash_access_key_here') {
        return Array.from({ length: count }, (_, i) =>
            `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=${i}`
        );
    }

    try {
        const res = await fetch(
            `${BASE}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
            { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
        );
        const data = await res.json();
        if (data.results) {
            return data.results.map(r => r.urls.regular);
        }
    } catch (err) {
        console.warn('Unsplash fetch failed', err);
    }

    return Array.from({ length: count }, (_, i) =>
        `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=${i}`
    );
};

/**
 * Simple: Get one image URL by keyword (synchronous with Unsplash's free source URL)
 * No API key needed for this one
 */
export const getImageUrl = (keyword, width = 400, height = 400) => {
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=${width}&h=${height}&fit=crop&q=80`;
};

// Pre-defined high-quality category banner images (Unsplash free)
export const CATEGORY_BANNERS = {
    'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&fit=crop',
    'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&fit=crop',
    'Home & Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&fit=crop',
    'Appliances': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&fit=crop',
    'Books': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop',
    'Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&fit=crop',
    'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop',
    'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&fit=crop',
    'Toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&fit=crop',
    'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&fit=crop',
    'Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop',
    'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop',
};

export default { getProductImage, getCategoryImages, getImageUrl, CATEGORY_BANNERS };

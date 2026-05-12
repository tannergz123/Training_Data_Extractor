require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const Config = {
    // Mark43 API base URL — used for local dev; deployed envs derive from x-forwarded-host header
    MARK43_BASE_URL: process.env.MARK43_BASE_URL || '',
    MARK43_FULL_BASE_URL: process.env.MARK43_FULL_BASE_URL || '',

    // API token — local dev fallback only. Deployed envs use M43AUTH session cookie from auth-proxy.
    MARK43_API_TOKEN: process.env.MARK43_API_TOKEN || '',

    // Base path for serving under a subpath (e.g. /my-app/). Must match k8s VirtualService route.
    BASE_PATH: process.env.BASE_PATH || '/',

    // Cache TTL in seconds
    CACHE_TIMEOUT_SECONDS: parseInt(process.env.CACHE_TIMEOUT_SECONDS || '300', 10),

    // Server port
    PORT: parseInt(process.env.PORT || '8080', 10),

    // Simple auth — credentials from env vars. Leave unset to disable auth.
    AUTH_USERNAME: process.env.AUTH_USERNAME || '',
    AUTH_PASSWORD: process.env.AUTH_PASSWORD || '',
    SESSION_SECRET: process.env.SESSION_SECRET || 'training-data-extractor-dev-secret',

    getFullBaseUrl() {
        if (this.MARK43_FULL_BASE_URL) return this.MARK43_FULL_BASE_URL;
        if (this.MARK43_BASE_URL) return `https://${this.MARK43_BASE_URL}.mark43.com`;
        return 'http://localhost:8080';
    },
};

module.exports = Config;

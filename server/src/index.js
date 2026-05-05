require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Config = require('./config');
const apiRouter = require('./routes/api');

const app = express();

// Required for correct rate limiting behind k8s ingress.
// Without this, Express sees the proxy IP for all requests.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Health endpoint registered BEFORE rate limiter — k8s probes hit this every
// 10-30 seconds and will exhaust the rate limit, causing 429s on liveness
// probes → pod restarts → crash loops.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', apiLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/api', apiRouter);

// ---------------------------------------------------------------------------
// Serve React build — SPA fallback for all non-API routes
//
// The <base href> tag is injected at runtime so the app can be served at any
// subpath (e.g. /my-app/) without rebuilding. The BASE_PATH env var must
// match the VirtualService route prefix in k8s.
// ---------------------------------------------------------------------------
const clientBuildPath = fs.existsSync(path.join(__dirname, '..', '..', 'client', 'dist'))
    ? path.join(__dirname, '..', '..', 'client', 'dist')
    : path.join(__dirname, '..', '..', 'dist');

app.use(express.static(clientBuildPath));

let indexHtmlWithBase = '';
try {
    const indexHtml = fs.readFileSync(path.join(clientBuildPath, 'index.html'), 'utf8');
    indexHtmlWithBase = indexHtml.replace('<head>', `<head><base href="${Config.BASE_PATH}">`);
} catch (e) {
    console.warn('WARNING: Could not read index.html — SPA fallback disabled:', e.message);
}

app.get('*', (req, res) => {
    if (indexHtmlWithBase) {
        res.type('html').send(indexHtmlWithBase);
    } else {
        res.status(404).send('Not found');
    }
});

// ---------------------------------------------------------------------------
// Start server
// NOTE: Run with --max-http-header-size=65536 in production (see Dockerfile).
// Auth-proxy injects large JWT headers that exceed Node's default 16KB limit.
// ---------------------------------------------------------------------------
function getVersionFromMd() {
    try {
        const versionMd = fs.readFileSync(path.resolve(__dirname, '..', '..', 'VERSION.md'), 'utf8');
        const match = versionMd.match(/^## (v\d+\.\d+\.\d+)/m);
        return match ? match[1] : 'unknown';
    } catch (err) {
        console.error('Failed to read VERSION.md:', err.message);
        return 'unknown';
    }
}

app.listen(Config.PORT, () => {
    console.log('============================================================');
    console.log(`training-data-extractor ${getVersionFromMd()} (Express)`);
    console.log('============================================================');
    console.log(`Server running at: http://localhost:${Config.PORT}`);
    console.log(`Base path: ${Config.BASE_PATH}`);
    console.log('============================================================');
});

require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Config = require('./config');
const apiRouter = require('./routes/api');

// ---------------------------------------------------------------------------
// Simple session store — maps token → expiry. Tokens live in a cookie.
// ---------------------------------------------------------------------------
const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function createSession(res) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    res.cookie('session', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS,
        secure: process.env.NODE_ENV === 'production',
    });
    return token;
}

function isAuthenticated(req) {
    const token = req.cookies?.session;
    if (!token) return false;
    const expiry = sessions.get(token);
    if (!expiry || Date.now() > expiry) {
        sessions.delete(token);
        return false;
    }
    return true;
}

function authGuard(req, res, next) {
    // Auth disabled when no credentials configured
    if (!Config.AUTH_USERNAME || !Config.AUTH_PASSWORD) return next();
    if (isAuthenticated(req)) return next();
    // API requests get 401; page requests get redirected
    if (req.path.startsWith('/api')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return next();
}

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

// ---------------------------------------------------------------------------
// Cookie parser (lightweight, no dependency)
// ---------------------------------------------------------------------------
app.use((req, _res, next) => {
    req.cookies = {};
    const header = req.headers.cookie;
    if (header) {
        header.split(';').forEach((pair) => {
            const [name, ...rest] = pair.trim().split('=');
            if (name) req.cookies[name.trim()] = decodeURIComponent(rest.join('='));
        });
    }
    next();
});

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
// Auth endpoints — login, logout, session check
// ---------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === Config.AUTH_USERNAME && password === Config.AUTH_PASSWORD) {
        createSession(res);
        return res.json({ success: true });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.cookies?.session;
    if (token) sessions.delete(token);
    res.clearCookie('session');
    res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
    // Auth disabled — always authenticated
    if (!Config.AUTH_USERNAME || !Config.AUTH_PASSWORD) {
        return res.json({ authenticated: true, authEnabled: false });
    }
    return res.json({ authenticated: isAuthenticated(req), authEnabled: true });
});

// ---------------------------------------------------------------------------
// Auth guard — protects API routes and SPA
// ---------------------------------------------------------------------------
app.use(authGuard);

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

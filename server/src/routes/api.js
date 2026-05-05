const express = require('express');
const axios = require('axios');
const Config = require('../config');
const { isNonEmptyString, sanitizeString, sanitizeEmailSubject, pick } = require('../utils/security');

const router = express.Router();

// ---------------------------------------------------------------------------
// Auth helpers
//
// This pattern is used by all Mark43 marketplace apps (Evidence WebForm,
// Missing Persons Dashboard). It handles two auth modes:
//
//   1. Session auth (deployed with auth-proxy) — uses M43AUTH cookie + CSRF token
//   2. API token auth (local dev without auth-proxy) — uses MARK43_API_TOKEN env var
//
// IMPORTANT:
//   - GET requests only need the M43AUTH cookie
//   - POST/PUT/DELETE also require a CSRF token (x-session-token query param)
//   - Without the CSRF token, POST requests return 401 "Invalid email and/or password"
// ---------------------------------------------------------------------------

function getCookie(cookieHeader, name) {
    const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
}

function getBaseUrl(req) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (host) return `https://${host}`;
    return Config.getFullBaseUrl();
}

function getUserAuth(req) {
    const m43auth = getCookie(req.headers.cookie, 'M43AUTH');
    const csrfToken = req.headers['x-m43-csrf-token'] || '';

    if (m43auth) {
        return { m43auth, csrfToken, baseUrl: getBaseUrl(req) };
    }

    if (Config.MARK43_API_TOKEN) {
        return { apiToken: Config.MARK43_API_TOKEN, baseUrl: Config.getFullBaseUrl() };
    }

    return {};
}

function isAuthenticated(auth) {
    return auth.m43auth || auth.apiToken;
}

function buildHeaders(auth) {
    if (auth.m43auth) {
        return { Cookie: `M43AUTH=${auth.m43auth}`, 'Content-Type': 'application/json' };
    }
    if (auth.apiToken) {
        return { Authorization: `Basic ${auth.apiToken}`, 'Content-Type': 'application/json' };
    }
    return {};
}

function buildParams(auth, method, extra = {}) {
    const params = { ...extra };
    if (method !== 'GET' && auth.csrfToken) {
        params['x-session-token'] = auth.csrfToken;
    }
    return params;
}

// ---------------------------------------------------------------------------
// Logging helpers — sanitise auth headers before logging
// ---------------------------------------------------------------------------

function logRequest(label, method, url, headers, params, body) {
    console.log(`[${label}] ${method} ${url}`);
    console.log(`[${label}] params:`, JSON.stringify(params));
    console.log(`[${label}] headers (sanitized):`, JSON.stringify({
        ...headers,
        Cookie: headers.Cookie ? 'M43AUTH=***' : undefined,
        Authorization: headers.Authorization ? '***' : undefined,
    }));
    if (body !== undefined) console.log(`[${label}] body:`, JSON.stringify(body));
}

function logResponse(label, status, data) {
    console.log(`[${label}] response status: ${status}`);
    console.log(`[${label}] response body:`, JSON.stringify(data)?.substring(0, 500));
}

function logError(label, err) {
    if (err.response) {
        console.error(`[${label}] error status: ${err.response.status}`);
        console.error(`[${label}] error body:`, JSON.stringify(err.response.data)?.substring(0, 500));
    } else {
        console.error(`[${label}] error: ${err.message}`);
    }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// NOTE: /api/health is defined in index.js BEFORE the rate limiter so k8s
// probes don't exhaust the rate limit and trigger pod restarts.

// ---------------------------------------------------------------------------
// V2 Partnerships API proxy routes
// ---------------------------------------------------------------------------

router.get('/reports/:reportId', async (req, res) => {
    const auth = getUserAuth(req);
    if (!isAuthenticated(auth)) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { reportId } = req.params;
    if (!isNonEmptyString(reportId)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid reportId' });
    }

    const url = `${auth.baseUrl}/rms/api/v2/openapi/reports/${encodeURIComponent(reportId)}`;
    const params = buildParams(auth, 'GET');
    const headers = buildHeaders(auth);

    logRequest('reports', 'GET', url, headers, params, undefined);

    try {
        const response = await axios.get(url, { headers, params, timeout: 30000 });
        logResponse('reports', response.status, response.data);
        res.json(response.data);
    } catch (err) {
        logError('reports', err);
        if (err.response) return res.status(err.response.status).json(err.response.data);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/report_types/:id', async (req, res) => {
    const auth = getUserAuth(req);
    if (!isAuthenticated(auth)) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    if (!isNonEmptyString(id)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid report type id' });
    }

    const url = `${auth.baseUrl}/rms/api/v2/openapi/report_types/${encodeURIComponent(id)}`;
    const params = buildParams(auth, 'GET');
    const headers = buildHeaders(auth);

    logRequest('report_types', 'GET', url, headers, params, undefined);

    try {
        const response = await axios.get(url, { headers, params, timeout: 30000 });
        logResponse('report_types', response.status, response.data);
        res.json(response.data);
    } catch (err) {
        logError('report_types', err);
        if (err.response) return res.status(err.response.status).json(err.response.data);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/form/:formId/version/:formVersion/contract', async (req, res) => {
    const auth = getUserAuth(req);
    if (!isAuthenticated(auth)) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { formId, formVersion } = req.params;
    if (!isNonEmptyString(formId) || !isNonEmptyString(formVersion)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid formId or formVersion' });
    }

    const url = `${auth.baseUrl}/rms/api/v2/openapi/form/${encodeURIComponent(formId)}/version/${encodeURIComponent(formVersion)}/contract`;
    const params = buildParams(auth, 'GET');
    const headers = buildHeaders(auth);

    logRequest('form-contract', 'GET', url, headers, params, undefined);

    try {
        const response = await axios.get(url, { headers, params, timeout: 30000 });
        logResponse('form-contract', response.status, response.data);
        res.json(response.data);
    } catch (err) {
        logError('form-contract', err);
        if (err.response) return res.status(err.response.status).json(err.response.data);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

// Forwards CSRF token to Express proxy (needed for POST/PUT/DELETE requests).
// Usage: fetch('api/endpoint', { credentials: 'include', headers: { ...getAuthHeaders() } })
export function getAuthHeaders(): Record<string, string> {
    const csrfToken = sessionStorage.getItem('csrfToken') || '';
    return csrfToken ? { 'X-M43-Csrf-Token': csrfToken } : {};
}

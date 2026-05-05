import type { ExtractionResponseT } from '../types/apiTypes';
import { getAuthHeaders } from './authHeaders';

export async function extractReports(
    tenantUrl: string,
    apiToken: string,
    reportIds: string[],
): Promise<ExtractionResponseT> {
    const response = await fetch('/api/extract', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ tenantUrl, apiToken, reportIds }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}

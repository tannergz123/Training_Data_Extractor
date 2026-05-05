import { useState } from 'react';
import { Box, Button, Flex, InlineBanner, Text } from 'arc';
import { extractReports } from '../services/extractionApi';
import { transformToBlacksmith } from '../transform';
import type { TransformResultT, ApiReportT } from '../transform';
import { JsonPreview } from './JsonPreview';
import { downloadJson } from '../utils/download';

type ExtractionStateT =
    | { phase: 'idle' }
    | { phase: 'loading' }
    | { phase: 'error'; message: string }
    | { phase: 'done'; result: TransformResultT; errors: string[] };

const INPUT_STYLE: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
};

export function ExtractionForm() {
    const [tenantUrl, setTenantUrl] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [reportIds, setReportIds] = useState('');
    const [agencyOri, setAgencyOri] = useState('');
    const [state, setState] = useState<ExtractionStateT>({ phase: 'idle' });

    const parseReportIds = (): string[] =>
        reportIds
            .split(/[,\n]+/)
            .map((id) => id.trim())
            .filter(Boolean);

    const handleExtract = async () => {
        const ids = parseReportIds();
        if (!tenantUrl.trim() || !apiToken.trim() || ids.length === 0 || !agencyOri.trim()) return;

        setState({ phase: 'loading' });

        try {
            const response = await extractReports(tenantUrl.trim(), apiToken.trim(), ids);
            const successfulReports: ApiReportT[] = [];
            const errors: string[] = [];

            for (const r of response.results) {
                if (r.success) {
                    successfulReports.push(r.data);
                } else {
                    errors.push(`Report ${r.reportId}: ${r.message} (${r.status})`);
                }
            }

            if (successfulReports.length === 0) {
                setState({ phase: 'error', message: `All reports failed:\n${errors.join('\n')}` });
                return;
            }

            const result = transformToBlacksmith(successfulReports, agencyOri.trim());
            setState({ phase: 'done', result, errors });
        } catch (err) {
            setState({
                phase: 'error',
                message: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    const handleDownloadAll = () => {
        if (state.phase !== 'done') return;
        const files = [
            { name: 'names.json', data: state.result.names },
            { name: 'items.json', data: state.result.items },
            { name: 'reports.json', data: state.result.reports },
            { name: 'cases.json', data: state.result.cases },
        ];
        for (const file of files) {
            downloadJson(file.data, file.name);
        }
    };

    const isFormValid =
        tenantUrl.trim() !== '' &&
        apiToken.trim() !== '' &&
        parseReportIds().length > 0 &&
        agencyOri.trim() !== '';

    return (
        <Box>
            <Box mb={4}>
                <Box mb={3}>
                    <Box mb={1}>
                        <Text as="label" fontWeight="bold">Tenant URL</Text>
                    </Box>
                    <input
                        type="url"
                        placeholder="https://tenant.mark43.com"
                        value={tenantUrl}
                        onChange={(e) => setTenantUrl(e.target.value)}
                        style={INPUT_STYLE}
                    />
                </Box>

                <Box mb={3}>
                    <Box mb={1}>
                        <Text as="label" fontWeight="bold">API Token</Text>
                    </Box>
                    <input
                        type="password"
                        placeholder="Paste your API token"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        style={INPUT_STYLE}
                    />
                </Box>

                <Box mb={3}>
                    <Box mb={1}>
                        <Text as="label" fontWeight="bold">Agency ORI</Text>
                    </Box>
                    <input
                        type="text"
                        placeholder="e.g. blacksmithori"
                        value={agencyOri}
                        onChange={(e) => setAgencyOri(e.target.value)}
                        style={INPUT_STYLE}
                    />
                    <Box mt={1}>
                        <Text color="secondary" fontSize="sm">
                            The ORI string for the target Blacksmith tenant (not available from the V2 API)
                        </Text>
                    </Box>
                </Box>

                <Box mb={3}>
                    <Box mb={1}>
                        <Text as="label" fontWeight="bold">Report ID(s)</Text>
                    </Box>
                    <textarea
                        placeholder="Enter report IDs (comma-separated or one per line)"
                        value={reportIds}
                        onChange={(e) => setReportIds(e.target.value)}
                        rows={4}
                        style={{
                            ...INPUT_STYLE,
                            fontFamily: 'monospace',
                            resize: 'vertical',
                        }}
                    />
                    <Box mt={1}>
                        <Text color="secondary" fontSize="sm">
                            {parseReportIds().length} report ID(s) detected
                        </Text>
                    </Box>
                </Box>

                <Button
                    onClick={handleExtract}
                    disabled={!isFormValid || state.phase === 'loading'}
                >
                    {state.phase === 'loading' ? 'Extracting...' : 'Extract Reports'}
                </Button>
            </Box>

            {state.phase === 'error' && (
                <Box mb={4}>
                    <InlineBanner status="error">
                        {state.message}
                    </InlineBanner>
                </Box>
            )}

            {state.phase === 'done' && (
                <Box>
                    {state.errors.length > 0 && (
                        <Box mb={4}>
                            <InlineBanner status="attention">
                                {state.errors.map((err, i) => (
                                    <Text key={i} fontSize="sm">{err}</Text>
                                ))}
                            </InlineBanner>
                        </Box>
                    )}

                    <Flex justifyContent="space-between" alignItems="center" mb={3}>
                        <Text as="h2" variant="headingMd">
                            Output Files
                        </Text>
                        <Button variant="secondary" onClick={handleDownloadAll}>
                            Download All Files
                        </Button>
                    </Flex>

                    <JsonPreview
                        title="names.json"
                        filename="names.json"
                        data={state.result.names}
                    />
                    <JsonPreview
                        title="items.json"
                        filename="items.json"
                        data={state.result.items}
                    />
                    <JsonPreview
                        title="reports.json"
                        filename="reports.json"
                        data={state.result.reports}
                    />
                    <JsonPreview
                        title="cases.json"
                        filename="cases.json"
                        data={state.result.cases}
                        note="Empty for MVP -- case extraction coming in Phase 2"
                    />
                </Box>
            )}
        </Box>
    );
}

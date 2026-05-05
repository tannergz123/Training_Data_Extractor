import { useState } from 'react';
import { Button, Card, CardBody, Flex, FormControl, InlineBanner, Input, Text, Textarea, VStack } from 'arc';
import { extractReports } from '../services/extractionApi';
import { transformToBlacksmith } from '../transform';
import type { TransformResultT, ApiReportT } from '../transform';
import type { ApiCaseDetailsT } from '../transform/transformTypes';
import { JsonPreview } from './JsonPreview';
import { downloadJson } from '../utils/download';

type ExtractionStateT =
    | { phase: 'idle' }
    | { phase: 'loading' }
    | { phase: 'error'; message: string }
    | { phase: 'done'; result: TransformResultT; errors: string[] };

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
        if (!tenantUrl.trim() || !apiToken.trim() || ids.length === 0) return;

        setState({ phase: 'loading' });

        try {
            const response = await extractReports(tenantUrl.trim(), apiToken.trim(), ids);
            const successfulReports: ApiReportT[] = [];
            const reportCases: ApiCaseDetailsT[][] = [];
            const errors: string[] = [];

            for (const r of response.results) {
                if (r.success) {
                    successfulReports.push(r.data);
                    reportCases.push(r.cases ?? []);
                } else {
                    errors.push(`Report ${r.reportId}: ${r.message} (${r.status})`);
                }
            }

            if (successfulReports.length === 0) {
                setState({ phase: 'error', message: `All reports failed:\n${errors.join('\n')}` });
                return;
            }

            const result = transformToBlacksmith(successfulReports, agencyOri.trim(), reportCases);
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
        parseReportIds().length > 0;

    const reportIdCount = parseReportIds().length;

    return (
        <VStack align="stretch" gap={4}>
            <Card>
                <CardBody>
                    <VStack align="stretch" gap={1} mb={4}>
                        <Text variant="headingSm" fontWeight="bold">Connection</Text>
                        <Text variant="caption" color="secondary">
                            Enter the tenant URL and API token to connect to the RMS API
                        </Text>
                    </VStack>

                    <VStack align="stretch" gap={4}>
                        <FormControl
                            label="Tenant URL"
                            isRequired
                            htmlFor="tenant_url"
                            helpText="The Mark43 tenant URL (e.g. https://tenant.mark43.com)"
                        >
                            <Input
                                id="tenant_url"
                                value={tenantUrl}
                                onChange={(e) => setTenantUrl(e.target.value)}
                                placeholder="https://tenant.mark43.com"
                            />
                        </FormControl>

                        <FormControl
                            label="API Token"
                            isRequired
                            htmlFor="api_token"
                            helpText="RMS super user token or any valid API token"
                        >
                            <Input
                                id="api_token"
                                type="password"
                                value={apiToken}
                                onChange={(e) => setApiToken(e.target.value)}
                                placeholder="Paste your API token"
                            />
                        </FormControl>
                    </VStack>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <VStack align="stretch" gap={1} mb={4}>
                        <Text variant="headingSm" fontWeight="bold">Report Selection</Text>
                        <Text variant="caption" color="secondary">
                            Enter the report IDs to extract and an optional agency ORI override
                        </Text>
                    </VStack>

                    <VStack align="stretch" gap={4}>
                        <FormControl
                            label="Report ID(s)"
                            isRequired
                            htmlFor="report_ids"
                            helpText={`${reportIdCount} report ID${reportIdCount !== 1 ? 's' : ''} detected — comma-separated or one per line`}
                        >
                            <Textarea
                                id="report_ids"
                                value={reportIds}
                                onChange={(e) => setReportIds(e.target.value)}
                                placeholder="652503723, 652503724"
                                rows={3}
                            />
                        </FormControl>

                        <FormControl
                            label="Agency ORI"
                            htmlFor="agency_ori"
                            helpText="Optional — auto-extracted from the API response if available"
                        >
                            <Input
                                id="agency_ori"
                                value={agencyOri}
                                onChange={(e) => setAgencyOri(e.target.value)}
                                placeholder="e.g. NJNYPOA99"
                            />
                        </FormControl>
                    </VStack>
                </CardBody>
            </Card>

            <Button
                variant="solid"
                onClick={handleExtract}
                isDisabled={!isFormValid || state.phase === 'loading'}
                isLoading={state.phase === 'loading'}
            >
                Extract Reports
            </Button>

            {state.phase === 'error' && (
                <InlineBanner status="error" description={state.message} />
            )}

            {state.phase === 'done' && (
                <VStack align="stretch" gap={4}>
                    {state.errors.length > 0 && (
                        <InlineBanner
                            status="attention"
                            description={state.errors.join('\n')}
                        />
                    )}

                    <Flex justifyContent="space-between" alignItems="center">
                        <Text variant="headingMd" fontWeight="bold">Output Files</Text>
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
                    />
                </VStack>
            )}
        </VStack>
    );
}

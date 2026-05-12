import type { ApiReportT, BlacksmithReportT } from './transformTypes';

function isAttributeStub(value: unknown): value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const obj = value as Record<string, unknown>;
    return 'mark43Id' in obj && 'attributeType' in obj;
}

function isEntityStub(value: unknown): value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const obj = value as Record<string, unknown>;
    return 'mark43Id' in obj && !('attributeType' in obj);
}

function cleanFormsData(data: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === '') {
            cleaned[key] = null;
        } else if (isAttributeStub(value)) {
            cleaned[key] = (value as Record<string, unknown>).mark43Id;
        } else if (isEntityStub(value)) {
            cleaned[key] = (value as Record<string, unknown>).mark43Id;
        } else if (Array.isArray(value)) {
            cleaned[key] = value.map((item) => {
                if (isAttributeStub(item)) return (item as Record<string, unknown>).mark43Id;
                if (isEntityStub(item)) return (item as Record<string, unknown>).mark43Id;
                if (typeof item === 'object' && item !== null) return cleanFormsData(item as Record<string, unknown>);
                return item;
            });
        } else if (value !== null && typeof value === 'object') {
            cleaned[key] = cleanFormsData(value as Record<string, unknown>);
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

type PersonProfileRefT = { nameId: string; linkType: string };

export function transformReport(
    apiReport: ApiReportT,
    agencyOri: string,
    personProfileRefs: PersonProfileRefT[],
): BlacksmithReportT {
    // Find the first victim for the formsData victim field
    const victimRef = personProfileRefs.find((p) => p.linkType === 'VICTIM_IN_REPORT');

    return {
        reportingEventNumber: apiReport.reportingEventNumber,
        reportDefinitionName: apiReport.reportType,
        recordNumber: apiReport.recordNumber,
        agencyOri: apiReport.agency?.agencyOri ?? agencyOri,
        ...(apiReport.crimeDescription || apiReport.description
            ? { description: apiReport.crimeDescription ?? apiReport.description }
            : {}),
        isSealed: apiReport.isSealed ?? false,
        isNarrativeSealed: apiReport.isNarrativeSealed ?? false,
        isLegacyReport: apiReport.isLegacyReport ?? false,
        ...(apiReport.data ? {
            formsData: {
                ...cleanFormsData(apiReport.data),
                ...(victimRef ? { victim: `<name${victimRef.nameId}>` } : {}),
            },
        } : {}),
        approvalStatus: apiReport.approvalStatus ?? 'DRAFT',
        ...(apiReport.eventStartUtc ? { eventStartUtc: apiReport.eventStartUtc } : {}),
        ...(apiReport.eventEndUtc ? { eventEndUtc: apiReport.eventEndUtc } : {}),
        personProfileIds: personProfileRefs.map((p) => p.nameId),
    };
}

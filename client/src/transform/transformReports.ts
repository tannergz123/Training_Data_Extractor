import type { ApiReportT, BlacksmithReportT } from './transformTypes';

export function transformReport(
    apiReport: ApiReportT,
    agencyOri: string,
    reportPersonProfileIds: string[],
): BlacksmithReportT {
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
        ...(apiReport.data ? { formsData: apiReport.data } : {}),
        approvalStatus: apiReport.approvalStatus ?? 'DRAFT',
        ...(apiReport.eventStartUtc ? { eventStartUtc: apiReport.eventStartUtc } : {}),
        ...(apiReport.eventEndUtc ? { eventEndUtc: apiReport.eventEndUtc } : {}),
        personProfileIds: reportPersonProfileIds,
    };
}

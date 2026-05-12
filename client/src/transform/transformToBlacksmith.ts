import type { ApiReportT, ApiCaseDetailsT, TransformResultT } from './transformTypes';
import { createIdGenerator } from './idGenerator';
import { transformNames } from './transformNames';
import { transformItems } from './transformItems';
import { transformReport } from './transformReports';
import { transformCases } from './transformCases';

type ReportWithCasesT = {
    report: ApiReportT;
    cases: ApiCaseDetailsT[];
};

export function transformToBlacksmith(
    apiReports: ApiReportT[],
    agencyOri: string,
    reportCases?: ApiCaseDetailsT[][],
): TransformResultT {
    const nextId = createIdGenerator();
    const result: TransformResultT = {
        names: [],
        items: [],
        reports: [],
        cases: [],
    };

    const reportsWithCases: ReportWithCasesT[] = apiReports.map((report, i) => ({
        report,
        cases: reportCases?.[i] ?? [],
    }));

    for (const { report: apiReport, cases: apiCases } of reportsWithCases) {
        const reportRen = apiReport.reportingEventNumber ?? '';

        const caseResults = transformCases(apiCases, reportRen, [], nextId);
        const caseBlacksmithIds = caseResults.map((c) => c.id);

        const { names, personIdMap } = transformNames(
            apiReport.involvedPeople ?? [],
            reportRen,
            nextId,
            caseBlacksmithIds,
        );
        result.names.push(...names);

        const items = transformItems(
            apiReport.involvedProperties ?? [],
            apiReport.involvedVehicles ?? [],
            nextId,
        );
        result.items.push(...items);

        const personProfileRefs = personIdMap.map((ids) => ({
            nameId: ids.reportId,
            linkType: ids.linkType,
        }));
        const report = transformReport(apiReport, agencyOri, personProfileRefs);
        result.reports.push(report);

        for (let ci = 0; ci < caseResults.length; ci++) {
            const casePersonIds = personIdMap.map((ids) => ids.caseIds[ci]).filter(Boolean);
            caseResults[ci].personProfileIds = casePersonIds;
        }
        result.cases.push(...caseResults);
    }

    return result;
}

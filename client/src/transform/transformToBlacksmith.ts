import type { ApiReportT, TransformResultT } from './transformTypes';
import { createIdGenerator } from './idGenerator';
import { transformNames } from './transformNames';
import { transformItems } from './transformItems';
import { transformReport } from './transformReports';

export function transformToBlacksmith(
    apiReports: ApiReportT[],
    agencyOri: string,
): TransformResultT {
    const nextId = createIdGenerator();
    const result: TransformResultT = {
        names: [],
        items: [],
        reports: [],
        cases: [],
    };

    for (const apiReport of apiReports) {
        const reportRen = apiReport.reportingEventNumber ?? '';

        const { names, personIdMap } = transformNames(
            apiReport.involvedPeople ?? [],
            reportRen,
            nextId,
        );
        result.names.push(...names);

        const items = transformItems(
            apiReport.involvedProperties ?? [],
            apiReport.involvedVehicles ?? [],
            nextId,
        );
        result.items.push(...items);

        const reportPersonProfileIds = personIdMap.map((ids) => ids.reportId);
        const report = transformReport(apiReport, agencyOri, reportPersonProfileIds);
        result.reports.push(report);
    }

    return result;
}

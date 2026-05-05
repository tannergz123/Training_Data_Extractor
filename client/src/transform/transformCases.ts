import type { ApiCaseDetailsT, BlacksmithCaseT, IdGeneratorT } from './transformTypes';

export function transformCases(
    caseDetails: ApiCaseDetailsT[],
    reportRen: string,
    personProfileIds: string[],
    nextId: IdGeneratorT,
): BlacksmithCaseT[] {
    const cases: BlacksmithCaseT[] = [];

    for (const detail of caseDetails) {
        const theCase = detail.theCase;
        if (!theCase) continue;

        const caseId = nextId();

        cases.push({
            id: caseId,
            title: theCase.title ?? '',
            localId: theCase.localId ?? '',
            caseDefinitionName: theCase.title ?? '',
            reportingEventNumber: theCase.reportingEventNumber ?? reportRen,
            approvalStatus: detail.caseApprovalStatus ?? 'DRAFT',
            ...(detail.caseStatus?.statusAttrId != null
                ? { statusAttributeDisplayAbbreviation: String(detail.caseStatus.statusAttrId) }
                : {}),
            entityPermissions: (detail.entityPermissions ?? [])
                .filter((p): p is { roleName: string; operationType: string } =>
                    p.roleName != null && p.operationType != null)
                .map((p) => ({ roleName: p.roleName, operationType: p.operationType })),
            personProfileIds,
            reportRens: [theCase.reportingEventNumber ?? reportRen].filter(Boolean),
            tasks: [],
        });
    }

    return cases;
}

import type { ApiCaseDetailsT, BlacksmithCaseT, IdGeneratorT } from './transformTypes';

function extractApprovalStatus(caseApprovalStatus: ApiCaseDetailsT['caseApprovalStatus']): string {
    if (typeof caseApprovalStatus === 'string') return caseApprovalStatus;
    if (caseApprovalStatus && typeof caseApprovalStatus === 'object') return caseApprovalStatus.status ?? 'DRAFT';
    return 'DRAFT';
}

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
            caseDefinitionName: detail.caseDefinitionName ?? theCase.title ?? '',
            reportingEventNumber: theCase.reportingEventNumber ?? reportRen,
            approvalStatus: extractApprovalStatus(detail.caseApprovalStatus),
            ...(detail.caseStatus?.displayAbbreviation
                ? { statusAttributeDisplayAbbreviation: detail.caseStatus.displayAbbreviation }
                : detail.caseStatus?.statusAttrId != null
                    ? { statusAttributeDisplayAbbreviation: String(detail.caseStatus.statusAttrId) }
                    : {}),
            entityPermissions: (detail.entityPermissions ?? [])
                .filter((p) => p.operationType != null)
                .map((p) => ({
                    roleName: p.roleId != null ? String(p.roleId) : '',
                    operationType: p.operationType ?? '',
                })),
            personProfileIds,
            reportRens: [theCase.reportingEventNumber ?? reportRen].filter(Boolean),
            tasks: detail.tasks ?? [],
        });
    }

    return cases;
}

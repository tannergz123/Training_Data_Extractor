import { describe, it, expect } from 'vitest';
import { transformCases } from '../transformCases';
import { createIdGenerator } from '../idGenerator';
import type { ApiCaseDetailsT } from '../transformTypes';

describe('transformCases', () => {
    it('transforms a basic case detail', () => {
        const caseDetails: ApiCaseDetailsT[] = [
            {
                theCase: {
                    id: 100,
                    title: 'Homicide Case 29',
                    localId: '19-000001',
                    caseDefinitionId: 5,
                    reportingEventNumber: '4295294714',
                },
                caseApprovalStatus: 'DRAFT',
                caseStatus: { id: 1, statusAttrId: 12344 },
                entityPermissions: [
                    { roleName: 'ADMIN', operationType: 'MANAGE' },
                ],
            },
        ];

        const cases = transformCases(caseDetails, 'REN-FALLBACK', [], createIdGenerator());

        expect(cases).toHaveLength(1);
        expect(cases[0]).toEqual({
            id: '10001',
            title: 'Homicide Case 29',
            localId: '19-000001',
            caseDefinitionName: 'Homicide Case 29',
            reportingEventNumber: '4295294714',
            approvalStatus: 'DRAFT',
            statusAttributeDisplayAbbreviation: '12344',
            entityPermissions: [{ roleName: 'ADMIN', operationType: 'MANAGE' }],
            personProfileIds: [],
            reportRens: ['4295294714'],
            tasks: [],
        });
    });

    it('uses report REN as fallback when case has no reportingEventNumber', () => {
        const caseDetails: ApiCaseDetailsT[] = [
            {
                theCase: { id: 200, title: 'Test Case' },
                caseApprovalStatus: 'APPROVED',
            },
        ];

        const cases = transformCases(caseDetails, 'REN-FALLBACK', [], createIdGenerator());

        expect(cases[0].reportingEventNumber).toBe('REN-FALLBACK');
        expect(cases[0].reportRens).toEqual(['REN-FALLBACK']);
    });

    it('defaults approvalStatus to DRAFT when not provided', () => {
        const caseDetails: ApiCaseDetailsT[] = [
            { theCase: { id: 300, title: 'No Status' } },
        ];

        const cases = transformCases(caseDetails, 'REN', [], createIdGenerator());

        expect(cases[0].approvalStatus).toBe('DRAFT');
    });

    it('omits statusAttributeDisplayAbbreviation when no statusAttrId', () => {
        const caseDetails: ApiCaseDetailsT[] = [
            { theCase: { id: 400, title: 'Minimal' } },
        ];

        const cases = transformCases(caseDetails, 'REN', [], createIdGenerator());

        expect(cases[0].statusAttributeDisplayAbbreviation).toBeUndefined();
    });

    it('filters out entity permissions with missing fields', () => {
        const caseDetails: ApiCaseDetailsT[] = [
            {
                theCase: { id: 500, title: 'Perms Test' },
                entityPermissions: [
                    { roleName: 'ADMIN', operationType: 'MANAGE' },
                    { roleName: undefined, operationType: 'READ' },
                    { roleName: 'USER' },
                ],
            },
        ];

        const cases = transformCases(caseDetails, 'REN', [], createIdGenerator());

        expect(cases[0].entityPermissions).toEqual([
            { roleName: 'ADMIN', operationType: 'MANAGE' },
        ]);
    });

    it('handles empty case details array', () => {
        const cases = transformCases([], 'REN', [], createIdGenerator());
        expect(cases).toHaveLength(0);
    });

    it('handles multiple cases with sequential IDs', () => {
        const caseDetails: ApiCaseDetailsT[] = [
            { theCase: { id: 1, title: 'Case A' } },
            { theCase: { id: 2, title: 'Case B' } },
        ];

        const cases = transformCases(caseDetails, 'REN', [], createIdGenerator());

        expect(cases).toHaveLength(2);
        expect(cases[0].id).toBe('10001');
        expect(cases[1].id).toBe('10002');
    });

    it('skips entries with no theCase', () => {
        const caseDetails = [
            { theCase: { id: 1, title: 'Valid' } },
            {} as ApiCaseDetailsT,
        ];

        const cases = transformCases(caseDetails, 'REN', [], createIdGenerator());

        expect(cases).toHaveLength(1);
    });
});

import { describe, it, expect } from 'vitest';
import { transformReport } from '../transformReports';
import type { ApiReportT } from '../transformTypes';

describe('transformReport', () => {
    it('maps all report fields correctly', () => {
        const apiReport: ApiReportT = {
            reportingEventNumber: '4295294714',
            reportType: 'GMP Stop & Search',
            recordNumber: '3719040688',
            description: 'Report Description #1',
            isSealed: false,
            isNarrativeSealed: false,
            isLegacyReport: false,
            approvalStatus: 'DRAFT',
            eventStartUtc: '2026-04-25T14:30:00+02:00',
            eventEndUtc: '2026-04-27T14:30:00+02:00',
            data: { field1: 'value1', field2: 42 },
        };

        const report = transformReport(apiReport, 'blacksmithori', ['10004', '10005']);

        expect(report).toEqual({
            reportingEventNumber: '4295294714',
            reportDefinitionName: 'GMP Stop & Search',
            recordNumber: '3719040688',
            agencyOri: 'blacksmithori',
            description: 'Report Description #1',
            isSealed: false,
            isNarrativeSealed: false,
            isLegacyReport: false,
            formsData: { field1: 'value1', field2: 42 },
            approvalStatus: 'DRAFT',
            eventStartUtc: '2026-04-25T14:30:00+02:00',
            eventEndUtc: '2026-04-27T14:30:00+02:00',
            personProfileIds: ['10004', '10005'],
        });
    });

    it('uses agencyOri from user input', () => {
        const report = transformReport({}, 'myori', []);
        expect(report.agencyOri).toBe('myori');
    });

    it('defaults boolean fields to false', () => {
        const report = transformReport({}, 'ori', []);
        expect(report.isSealed).toBe(false);
        expect(report.isNarrativeSealed).toBe(false);
        expect(report.isLegacyReport).toBe(false);
    });

    it('defaults approvalStatus to DRAFT', () => {
        const report = transformReport({}, 'ori', []);
        expect(report.approvalStatus).toBe('DRAFT');
    });

    it('omits optional fields when not present', () => {
        const report = transformReport({}, 'ori', []);
        expect(report.description).toBeUndefined();
        expect(report.formsData).toBeUndefined();
        expect(report.eventStartUtc).toBeUndefined();
        expect(report.eventEndUtc).toBeUndefined();
    });

    it('sets personProfileIds from provided array', () => {
        const report = transformReport({}, 'ori', ['100', '200', '300']);
        expect(report.personProfileIds).toEqual(['100', '200', '300']);
    });
});

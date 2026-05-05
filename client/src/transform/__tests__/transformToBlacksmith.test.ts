import { describe, it, expect } from 'vitest';
import { transformToBlacksmith } from '../transformToBlacksmith';
import type { ApiReportT } from '../transformTypes';

describe('transformToBlacksmith', () => {
    const fullReport: ApiReportT = {
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
        data: { filersOfficerName: 'Storm, Peter' },
        involvedPeople: [
            {
                personProfile: {
                    firstName: 'John',
                    lastName: 'Smith',
                    sex: { displayAbbreviation: '02' },
                    race: { displayAbbreviation: 'B' },
                    isJuvenile: false,
                },
            },
            {
                personProfile: {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    dateOfBirth: '2012-02-21',
                    sex: { displayAbbreviation: '02' },
                    isJuvenile: true,
                },
            },
        ],
        involvedProperties: [
            {
                item: {
                    itemDescription: 'Drugs 12',
                    itemType: { displayAbbreviation: '11' },
                    itemCategory: { displayAbbreviation: '10' },
                    primaryColor: { displayAbbreviation: 'RED' },
                    serialNumber: 'SN123456789',
                },
            },
        ],
        involvedVehicles: [
            {
                vehicle: {
                    vinNumber: '1HGCM82633A123456',
                    yearOfManufacture: 2020,
                    bodyStyle: { displayAbbreviation: 'T' },
                    vehicleMakeAndModel: {
                        vehicleMakeName: 'Load Rite',
                        vehicleModelName: 'Kjm-700',
                    },
                    itemProfile: {
                        itemDescription: 'Vehicle 87',
                        itemType: { displayAbbreviation: '2' },
                        itemCategory: { displayAbbreviation: '37' },
                        serialNumber: 'SN123456787',
                    },
                },
            },
        ],
    };

    it('produces all 4 output arrays', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');

        expect(result).toHaveProperty('names');
        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('reports');
        expect(result).toHaveProperty('cases');
    });

    it('produces correct name count (2 per person)', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        expect(result.names).toHaveLength(4);
    });

    it('produces correct item count (properties + vehicles)', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        expect(result.items).toHaveLength(2);
    });

    it('produces one report entry', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        expect(result.reports).toHaveLength(1);
    });

    it('produces empty cases for MVP', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        expect(result.cases).toEqual([]);
    });

    it('links report personProfileIds to REPORT-owned names', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        const reportPersonIds = result.reports[0].personProfileIds;
        expect(reportPersonIds).toHaveLength(2);

        for (const id of reportPersonIds) {
            const name = result.names.find(
                (n) => n.personProfile.id === id && n.personProfile.owner.entityType === 'REPORT',
            );
            expect(name).toBeDefined();
        }
    });

    it('maps formsData from data field', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        expect(result.reports[0].formsData).toEqual({ filersOfficerName: 'Storm, Peter' });
    });

    it('maps reportType to reportDefinitionName', () => {
        const result = transformToBlacksmith([fullReport], 'blacksmithori');
        expect(result.reports[0].reportDefinitionName).toBe('GMP Stop & Search');
    });

    it('sets agencyOri from user input', () => {
        const result = transformToBlacksmith([fullReport], 'testori');
        expect(result.reports[0].agencyOri).toBe('testori');
    });

    it('uses sequential IDs starting from 10001', () => {
        const result = transformToBlacksmith([fullReport], 'ori');
        expect(result.names[0].personProfile.id).toBe('10001');
    });

    it('handles report with no people', () => {
        const report: ApiReportT = {
            reportingEventNumber: 'REN-1',
            data: { test: true },
        };

        const result = transformToBlacksmith([report], 'ori');
        expect(result.names).toHaveLength(0);
        expect(result.reports[0].personProfileIds).toEqual([]);
    });

    it('handles report with no items or vehicles', () => {
        const report: ApiReportT = {
            reportingEventNumber: 'REN-2',
        };

        const result = transformToBlacksmith([report], 'ori');
        expect(result.items).toHaveLength(0);
    });

    it('handles multiple reports with sequential IDs across all', () => {
        const report1: ApiReportT = {
            reportingEventNumber: 'REN-A',
            involvedPeople: [
                { personProfile: { firstName: 'Alice', lastName: 'A' } },
            ],
        };
        const report2: ApiReportT = {
            reportingEventNumber: 'REN-B',
            involvedPeople: [
                { personProfile: { firstName: 'Bob', lastName: 'B' } },
            ],
        };

        const result = transformToBlacksmith([report1, report2], 'ori');

        expect(result.names).toHaveLength(4);
        expect(result.reports).toHaveLength(2);

        const allIds = result.names.map((n) => n.personProfile.id);
        const uniqueIds = new Set(allIds);
        expect(uniqueIds.size).toBe(allIds.length);
    });

    it('groups masters before report copies', () => {
        const result = transformToBlacksmith([fullReport], 'ori');

        const masterNames = result.names.filter(
            (n) => n.personProfile.owner.entityType === 'PERSON_PROFILE',
        );
        const reportNames = result.names.filter(
            (n) => n.personProfile.owner.entityType === 'REPORT',
        );

        expect(masterNames).toHaveLength(2);
        expect(reportNames).toHaveLength(2);

        // All masters should come before all report copies
        const lastMasterIdx = result.names.lastIndexOf(masterNames[masterNames.length - 1]);
        const firstReportIdx = result.names.indexOf(reportNames[0]);
        expect(lastMasterIdx).toBeLessThan(firstReportIdx);
    });

    it('masterPersonId links master and report copies', () => {
        const result = transformToBlacksmith([fullReport], 'ori');

        const johnCopies = result.names.filter(
            (n) => n.personProfile.firstName === 'John',
        );
        expect(johnCopies).toHaveLength(2);

        const masterPersonId = johnCopies[0].personProfile.masterPersonId;
        for (const copy of johnCopies) {
            expect(copy.personProfile.masterPersonId).toBe(masterPersonId);
        }
    });
});

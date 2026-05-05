import { describe, it, expect } from 'vitest';
import { transformNames } from '../transformNames';
import { createIdGenerator } from '../idGenerator';
import type { ApiInvolvedPersonT } from '../transformTypes';

describe('transformNames', () => {
    it('produces 2 copies per person grouped by owner type', () => {
        const people: ApiInvolvedPersonT[] = [
            {
                personProfile: {
                    firstName: 'John',
                    lastName: 'Smith',
                    isJuvenile: false,
                    sex: { displayAbbreviation: '02' },
                    race: { displayAbbreviation: 'B' },
                },
            },
        ];

        const { names, personIdMap } = transformNames(people, 'REN-123', createIdGenerator());

        expect(names).toHaveLength(2);
        expect(personIdMap).toHaveLength(1);

        // Master (PERSON_PROFILE owner) — first in output
        expect(names[0].personProfile.owner.entityType).toBe('PERSON_PROFILE');
        expect(names[0].personProfile.owner.ownerId).toBe('10001');
        expect(names[0].personProfile.id).toBe('10001');
        expect(names[0].personProfile.masterPersonId).toBe('10001');

        // Report copy — second in output
        expect(names[1].personProfile.owner.entityType).toBe('REPORT');
        expect(names[1].personProfile.owner.reportRen).toBe('REN-123');
        expect(names[1].personProfile.id).toBe('10002');
        expect(names[1].personProfile.masterPersonId).toBe('10001');
    });

    it('maps attribute displayAbbreviations correctly', () => {
        const people: ApiInvolvedPersonT[] = [
            {
                personProfile: {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    dateOfBirth: '2012-02-21',
                    isJuvenile: true,
                    sex: { displayAbbreviation: '02' },
                },
            },
        ];

        const { names } = transformNames(people, 'REN-456', createIdGenerator());

        expect(names[0].personProfile.sexAttributeDisplayAbbreviation).toBe('02');
        expect(names[0].personProfile.raceAttributeDisplayAbbreviation).toBeUndefined();
        expect(names[0].personProfile.dateOfBirth).toBe('2012-02-21');
        expect(names[0].personProfile.isJuvenile).toBe(true);
    });

    it('handles empty people array', () => {
        const { names, personIdMap } = transformNames([], 'REN-789', createIdGenerator());
        expect(names).toHaveLength(0);
        expect(personIdMap).toHaveLength(0);
    });

    it('handles person with no profile', () => {
        const people: ApiInvolvedPersonT[] = [{}];
        const { names } = transformNames(people, 'REN-999', createIdGenerator());
        expect(names).toHaveLength(0);
    });

    it('groups all masters before report copies with multiple people', () => {
        const people: ApiInvolvedPersonT[] = [
            { personProfile: { firstName: 'Alice', lastName: 'A' } },
            { personProfile: { firstName: 'Bob', lastName: 'B' } },
        ];

        const { names, personIdMap } = transformNames(people, 'REN-000', createIdGenerator());

        expect(names).toHaveLength(4);
        expect(personIdMap).toHaveLength(2);

        // Alice: master=10001, report=10002
        expect(personIdMap[0].masterId).toBe('10001');
        expect(personIdMap[0].reportId).toBe('10002');

        // Bob: master=10003, report=10004
        expect(personIdMap[1].masterId).toBe('10003');
        expect(personIdMap[1].reportId).toBe('10004');

        // Grouped: all masters first, then all report copies
        expect(names[0].personProfile.owner.entityType).toBe('PERSON_PROFILE');
        expect(names[0].personProfile.firstName).toBe('Alice');
        expect(names[1].personProfile.owner.entityType).toBe('PERSON_PROFILE');
        expect(names[1].personProfile.firstName).toBe('Bob');
        expect(names[2].personProfile.owner.entityType).toBe('REPORT');
        expect(names[2].personProfile.firstName).toBe('Alice');
        expect(names[3].personProfile.owner.entityType).toBe('REPORT');
        expect(names[3].personProfile.firstName).toBe('Bob');
    });

    it('omits optional fields when not present in source', () => {
        const people: ApiInvolvedPersonT[] = [
            { personProfile: { firstName: 'Min', lastName: 'Data' } },
        ];

        const { names } = transformNames(people, 'REN-MIN', createIdGenerator());

        expect(names[0].personProfile.dateOfBirth).toBeUndefined();
        expect(names[0].personProfile.sexAttributeDisplayAbbreviation).toBeUndefined();
        expect(names[0].personProfile.raceAttributeDisplayAbbreviation).toBeUndefined();
        expect(names[0].personProfile.isJuvenile).toBe(false);
    });

    it('produces CASE-owned copies when caseBlacksmithIds provided', () => {
        const people: ApiInvolvedPersonT[] = [
            {
                personProfile: {
                    firstName: 'John',
                    lastName: 'Smith',
                    sex: { displayAbbreviation: '02' },
                    race: { displayAbbreviation: 'B' },
                },
            },
        ];

        const { names, personIdMap } = transformNames(
            people, 'REN-123', createIdGenerator(), ['C100'],
        );

        expect(names).toHaveLength(3);
        expect(personIdMap[0].caseIds).toHaveLength(1);

        const caseCopy = names[2];
        expect(caseCopy.personProfile.owner.entityType).toBe('CASE');
        expect(caseCopy.personProfile.owner.ownerId).toBe('C100');
        expect(caseCopy.personProfile.masterPersonId).toBe('10001');
    });

    it('produces case copies for each case ID per person', () => {
        const people: ApiInvolvedPersonT[] = [
            { personProfile: { firstName: 'Alice', lastName: 'A' } },
        ];

        const { names, personIdMap } = transformNames(
            people, 'REN-X', createIdGenerator(), ['C1', 'C2'],
        );

        // master + report + 2 case copies = 4
        expect(names).toHaveLength(4);
        expect(personIdMap[0].caseIds).toHaveLength(2);

        const caseCopies = names.filter(
            (n) => n.personProfile.owner.entityType === 'CASE',
        );
        expect(caseCopies).toHaveLength(2);
        expect(caseCopies[0].personProfile.owner.ownerId).toBe('C1');
        expect(caseCopies[1].personProfile.owner.ownerId).toBe('C2');
    });

    it('produces no case copies when caseBlacksmithIds is empty', () => {
        const people: ApiInvolvedPersonT[] = [
            { personProfile: { firstName: 'Bob', lastName: 'B' } },
        ];

        const { names } = transformNames(people, 'REN-Y', createIdGenerator(), []);
        expect(names).toHaveLength(2);
    });

    it('produces no case copies when caseBlacksmithIds is undefined', () => {
        const people: ApiInvolvedPersonT[] = [
            { personProfile: { firstName: 'Bob', lastName: 'B' } },
        ];

        const { names } = transformNames(people, 'REN-Y', createIdGenerator());
        expect(names).toHaveLength(2);
    });
});

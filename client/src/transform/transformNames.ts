import type { ApiInvolvedPersonT, BlacksmithNameEntryT, IdGeneratorT } from './transformTypes';

type PersonIdsT = {
    masterId: string;
    reportId: string;
    caseIds: string[];
};

export function transformNames(
    involvedPeople: ApiInvolvedPersonT[],
    reportRen: string,
    nextId: IdGeneratorT,
    caseBlacksmithIds?: string[],
): { names: BlacksmithNameEntryT[]; personIdMap: PersonIdsT[] } {
    const masters: BlacksmithNameEntryT[] = [];
    const reportCopies: BlacksmithNameEntryT[] = [];
    const caseCopies: BlacksmithNameEntryT[] = [];
    const personIdMap: PersonIdsT[] = [];

    for (const person of involvedPeople) {
        const profile = person.personProfile;
        if (!profile) continue;

        const masterId = nextId();
        const reportId = nextId();
        const personCaseIds: string[] = [];

        const baseFields = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            ...(profile.dateOfBirth ? { dateOfBirth: profile.dateOfBirth } : {}),
            ...(profile.sex?.displayAbbreviation
                ? { sexAttributeDisplayAbbreviation: profile.sex.displayAbbreviation }
                : {}),
            ...(profile.race?.displayAbbreviation
                ? { raceAttributeDisplayAbbreviation: profile.race.displayAbbreviation }
                : {}),
            isJuvenile: profile.isJuvenile ?? false,
            masterPersonId: masterId,
        };

        masters.push({
            personProfile: {
                ...baseFields,
                id: masterId,
                owner: { entityType: 'PERSON_PROFILE', ownerId: masterId },
            },
        });

        reportCopies.push({
            personProfile: {
                ...baseFields,
                id: reportId,
                owner: { entityType: 'REPORT', reportRen },
            },
        });

        for (const caseId of caseBlacksmithIds ?? []) {
            const caseCopyId = nextId();
            personCaseIds.push(caseCopyId);
            caseCopies.push({
                personProfile: {
                    ...baseFields,
                    id: caseCopyId,
                    owner: { entityType: 'CASE', ownerId: caseId },
                },
            });
        }

        personIdMap.push({ masterId, reportId, caseIds: personCaseIds });
    }

    return { names: [...masters, ...reportCopies, ...caseCopies], personIdMap };
}

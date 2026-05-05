import type { ApiInvolvedPersonT, BlacksmithNameEntryT, IdGeneratorT } from './transformTypes';

type PersonIdsT = {
    masterId: string;
    reportId: string;
};

export function transformNames(
    involvedPeople: ApiInvolvedPersonT[],
    reportRen: string,
    nextId: IdGeneratorT,
): { names: BlacksmithNameEntryT[]; personIdMap: PersonIdsT[] } {
    const masters: BlacksmithNameEntryT[] = [];
    const reportCopies: BlacksmithNameEntryT[] = [];
    const personIdMap: PersonIdsT[] = [];

    for (const person of involvedPeople) {
        const profile = person.personProfile;
        if (!profile) continue;

        const masterId = nextId();
        const reportId = nextId();

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

        personIdMap.push({ masterId, reportId });
    }

    return { names: [...masters, ...reportCopies], personIdMap };
}

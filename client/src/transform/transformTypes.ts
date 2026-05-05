// ---------------------------------------------------------------------------
// V2 API response types (subset of fields we care about)
// ---------------------------------------------------------------------------

export type IdGeneratorT = () => string;

export type ApiAttributeStubT = {
    displayAbbreviation?: string;
    displayValue?: string;
    id?: number;
};

type ApiPersonProfileT = {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    isJuvenile?: boolean;
    sex?: ApiAttributeStubT;
    race?: ApiAttributeStubT;
    ethnicity?: ApiAttributeStubT;
    masterPersonProfileId?: number;
};

export type ApiInvolvedPersonT = {
    personProfile?: ApiPersonProfileT;
};

type ApiFirearmT = {
    firearmMake?: ApiAttributeStubT;
};

export type ApiItemT = {
    itemDescription?: string;
    itemType?: ApiAttributeStubT;
    itemCategory?: ApiAttributeStubT;
    primaryColor?: ApiAttributeStubT;
    serialNumber?: string;
    masterItemId?: number;
    itemMake?: string;
    itemModel?: string;
};

type ApiVehicleT = {
    vinNumber?: string;
    yearOfManufacture?: number;
    bodyStyle?: ApiAttributeStubT;
    vehicleMakeAndModel?: {
        vehicleMakeName?: string;
        vehicleModelName?: string;
    };
    itemProfile?: ApiItemT;
};

export type ApiInvolvedPropertyT = {
    item: ApiItemT;
    firearm?: ApiFirearmT;
};

export type ApiInvolvedVehicleT = {
    vehicle: ApiVehicleT;
};

export type ApiReportT = {
    reportingEventNumber?: string;
    reportType?: string;
    recordNumber?: string;
    description?: string;
    isSealed?: boolean;
    isNarrativeSealed?: boolean;
    isLegacyReport?: boolean;
    approvalStatus?: string;
    eventStartUtc?: string;
    eventEndUtc?: string;
    data?: Record<string, unknown>;
    involvedPeople?: ApiInvolvedPersonT[];
    involvedProperties?: ApiInvolvedPropertyT[];
    involvedVehicles?: ApiInvolvedVehicleT[];
};

// ---------------------------------------------------------------------------
// Blacksmith output types
// ---------------------------------------------------------------------------

type OwnerT = {
    entityType: 'PERSON_PROFILE' | 'REPORT';
    ownerId?: string;
    reportRen?: string;
};

export type BlacksmithPersonProfileT = {
    id: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    sexAttributeDisplayAbbreviation?: string;
    raceAttributeDisplayAbbreviation?: string;
    isJuvenile?: boolean;
    masterPersonId: string;
    owner: OwnerT;
};

export type BlacksmithNameEntryT = {
    personProfile: BlacksmithPersonProfileT;
};

type BlacksmithFirearmT = {
    firearmMakeAttributeDisplayAbbreviation?: string;
};

type BlacksmithVehicleT = {
    vinNumber?: string;
    yearOfManufacture?: number;
    bodyStyleAttributeDisplayAbbreviation?: string;
    vehicleMakeName?: string;
    vehicleModelName?: string;
};

export type BlacksmithItemT = {
    id: string;
    description?: string;
    itemTypeAttributeDisplayAbbreviation?: string;
    itemCategoryAttributeDisplayAbbreviation?: string;
    primaryColorAttributeDisplayAbbreviation?: string;
    serialNumber?: string;
    masterItemId: string;
    firearm?: BlacksmithFirearmT;
    vehicle?: BlacksmithVehicleT;
};

export type BlacksmithReportT = {
    reportingEventNumber?: string;
    reportDefinitionName?: string;
    recordNumber?: string;
    agencyOri: string;
    description?: string;
    isSealed?: boolean;
    isNarrativeSealed?: boolean;
    isLegacyReport?: boolean;
    formsData?: Record<string, unknown>;
    approvalStatus?: string;
    eventStartUtc?: string;
    eventEndUtc?: string;
    personProfileIds: string[];
};

export type BlacksmithCaseT = {
    id: string;
    title: string;
    localId: string;
    caseDefinitionName: string;
    reportingEventNumber: string;
    approvalStatus: string;
    personProfileIds: string[];
    reportRens: string[];
};

export type TransformResultT = {
    names: BlacksmithNameEntryT[];
    items: BlacksmithItemT[];
    reports: BlacksmithReportT[];
    cases: BlacksmithCaseT[];
};

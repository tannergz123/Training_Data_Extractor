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
    nameReportLink?: { linkType?: string };
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
    crimeDescription?: string;
    isSealed?: boolean;
    isNarrativeSealed?: boolean;
    isLegacyReport?: boolean;
    approvalStatus?: string;
    eventStartUtc?: string;
    eventEndUtc?: string;
    agency?: { agencyOri?: string; agencyCode?: string; agencyName?: string; mark43Id?: number };
    data?: Record<string, unknown>;
    involvedPeople?: ApiInvolvedPersonT[];
    involvedProperties?: ApiInvolvedPropertyT[];
    involvedVehicles?: ApiInvolvedVehicleT[];
};

// ---------------------------------------------------------------------------
// Blacksmith output types
// ---------------------------------------------------------------------------

type OwnerT = {
    entityType: 'PERSON_PROFILE' | 'REPORT' | 'CASE';
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
    personProfileIds: Array<{ nameId: string; linkType: string }>;
};

export type ApiCaseDetailsT = {
    theCase: {
        id: number;
        title?: string;
        localId?: string;
        caseDefinitionId?: number;
        reportingEventNumber?: string;
    };
    caseStatus?: { id: number; statusAttrId?: number; displayAbbreviation?: string };
    caseRoleLinks?: Array<{ roleId?: number; caseRoleAttrId?: number }>;
    entityPermissions?: Array<{ roleName?: string; operationType?: string }>;
    caseApprovalStatus?: { status?: string } | string;
    caseDefinitionName?: string;
    tasks?: Array<Record<string, unknown>>;
};

export type BlacksmithCaseT = {
    id: string;
    title: string;
    localId: string;
    caseDefinitionName: string;
    reportingEventNumber: string;
    approvalStatus: string;
    statusAttributeDisplayAbbreviation?: string;
    entityPermissions: Array<{ roleName: string; operationType: string }>;
    personProfileIds: string[];
    reportRens: string[];
    tasks: Array<Record<string, unknown>>;
};

export type TransformResultT = {
    names: BlacksmithNameEntryT[];
    items: BlacksmithItemT[];
    reports: BlacksmithReportT[];
    cases: BlacksmithCaseT[];
};

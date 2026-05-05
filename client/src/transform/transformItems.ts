import type {
    ApiInvolvedPropertyT,
    ApiInvolvedVehicleT,
    BlacksmithItemT,
    IdGeneratorT,
} from './transformTypes';

export function transformItems(
    properties: ApiInvolvedPropertyT[],
    vehicles: ApiInvolvedVehicleT[],
    nextId: IdGeneratorT,
): BlacksmithItemT[] {
    const items: BlacksmithItemT[] = [];

    for (const prop of properties) {
        const id = nextId();
        const src = prop.item;
        const item: BlacksmithItemT = {
            id,
            masterItemId: id,
            ...(src?.itemDescription ? { description: src.itemDescription } : {}),
            ...(src?.itemType?.displayAbbreviation
                ? { itemTypeAttributeDisplayAbbreviation: src.itemType.displayAbbreviation }
                : {}),
            ...(src?.itemCategory?.displayAbbreviation
                ? { itemCategoryAttributeDisplayAbbreviation: src.itemCategory.displayAbbreviation }
                : {}),
            ...(src?.primaryColor?.displayAbbreviation
                ? { primaryColorAttributeDisplayAbbreviation: src.primaryColor.displayAbbreviation }
                : {}),
            ...(src?.serialNumber ? { serialNumber: src.serialNumber } : {}),
        };

        if (prop.firearm?.firearmMake?.displayAbbreviation) {
            item.firearm = {
                firearmMakeAttributeDisplayAbbreviation: prop.firearm.firearmMake.displayAbbreviation,
            };
        }

        items.push(item);
    }

    for (const veh of vehicles) {
        const id = nextId();
        const src = veh.vehicle.itemProfile;
        const item: BlacksmithItemT = {
            id,
            masterItemId: id,
            ...(src?.itemDescription ? { description: src.itemDescription } : {}),
            ...(src?.itemType?.displayAbbreviation
                ? { itemTypeAttributeDisplayAbbreviation: src.itemType.displayAbbreviation }
                : {}),
            ...(src?.itemCategory?.displayAbbreviation
                ? { itemCategoryAttributeDisplayAbbreviation: src.itemCategory.displayAbbreviation }
                : {}),
            ...(src?.primaryColor?.displayAbbreviation
                ? { primaryColorAttributeDisplayAbbreviation: src.primaryColor.displayAbbreviation }
                : {}),
            ...(src?.serialNumber ? { serialNumber: src.serialNumber } : {}),
        };

        const v = veh.vehicle;
        item.vehicle = {
            ...(v.vinNumber ? { vinNumber: v.vinNumber } : {}),
            ...(v.yearOfManufacture != null ? { yearOfManufacture: v.yearOfManufacture } : {}),
            ...(v.bodyStyle?.displayAbbreviation
                ? { bodyStyleAttributeDisplayAbbreviation: v.bodyStyle.displayAbbreviation }
                : {}),
            ...(v.vehicleMakeAndModel?.vehicleMakeName
                ? { vehicleMakeName: v.vehicleMakeAndModel.vehicleMakeName }
                : {}),
            ...(v.vehicleMakeAndModel?.vehicleModelName
                ? { vehicleModelName: v.vehicleMakeAndModel.vehicleModelName }
                : {}),
        };

        items.push(item);
    }

    return items;
}

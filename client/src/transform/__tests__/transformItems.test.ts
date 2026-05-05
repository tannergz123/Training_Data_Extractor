import { describe, it, expect } from 'vitest';
import { transformItems } from '../transformItems';
import { createIdGenerator } from '../idGenerator';
import type { ApiInvolvedPropertyT, ApiInvolvedVehicleT } from '../transformTypes';

describe('transformItems', () => {
    it('transforms a basic property item', () => {
        const properties: ApiInvolvedPropertyT[] = [
            {
                item: {
                    itemDescription: 'Drugs 12',
                    itemType: { displayAbbreviation: '11' },
                    itemCategory: { displayAbbreviation: '10' },
                    primaryColor: { displayAbbreviation: 'RED' },
                    serialNumber: 'SN123456789',
                },
            },
        ];

        const items = transformItems(properties, [], createIdGenerator());

        expect(items).toHaveLength(1);
        expect(items[0]).toEqual({
            id: '10001',
            masterItemId: '10001',
            description: 'Drugs 12',
            itemTypeAttributeDisplayAbbreviation: '11',
            itemCategoryAttributeDisplayAbbreviation: '10',
            primaryColorAttributeDisplayAbbreviation: 'RED',
            serialNumber: 'SN123456789',
        });
    });

    it('transforms a firearm with nested firearm object', () => {
        const properties: ApiInvolvedPropertyT[] = [
            {
                item: {
                    itemDescription: 'Firearm 13',
                    itemType: { displayAbbreviation: '3' },
                    itemCategory: { displayAbbreviation: '59' },
                    primaryColor: { displayAbbreviation: 'BLK' },
                    serialNumber: 'SN123456788',
                },
                firearm: {
                    firearmMake: { displayAbbreviation: 'ASQ' },
                },
            },
        ];

        const items = transformItems(properties, [], createIdGenerator());

        expect(items).toHaveLength(1);
        expect(items[0].firearm).toEqual({
            firearmMakeAttributeDisplayAbbreviation: 'ASQ',
        });
    });

    it('transforms a vehicle with nested vehicle object', () => {
        const vehicles: ApiInvolvedVehicleT[] = [
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
        ];

        const items = transformItems([], vehicles, createIdGenerator());

        expect(items).toHaveLength(1);
        expect(items[0].description).toBe('Vehicle 87');
        expect(items[0].serialNumber).toBe('SN123456787');
        expect(items[0].vehicle).toEqual({
            vinNumber: '1HGCM82633A123456',
            yearOfManufacture: 2020,
            bodyStyleAttributeDisplayAbbreviation: 'T',
            vehicleMakeName: 'Load Rite',
            vehicleModelName: 'Kjm-700',
        });
    });

    it('merges properties and vehicles into one array', () => {
        const properties: ApiInvolvedPropertyT[] = [
            { item: { itemDescription: 'Item A', serialNumber: 'A' } },
        ];
        const vehicles: ApiInvolvedVehicleT[] = [
            { vehicle: { itemProfile: { itemDescription: 'Vehicle B', serialNumber: 'B' } } },
        ];

        const items = transformItems(properties, vehicles, createIdGenerator());

        expect(items).toHaveLength(2);
        expect(items[0].description).toBe('Item A');
        expect(items[1].description).toBe('Vehicle B');
    });

    it('handles empty arrays', () => {
        const items = transformItems([], [], createIdGenerator());
        expect(items).toHaveLength(0);
    });

    it('omits optional fields when item has no data', () => {
        const properties: ApiInvolvedPropertyT[] = [{ item: {} }];

        const items = transformItems(properties, [], createIdGenerator());

        expect(items).toHaveLength(1);
        expect(items[0].id).toBe('10001');
        expect(items[0].masterItemId).toBe('10001');
        expect(items[0].description).toBeUndefined();
        expect(items[0].serialNumber).toBeUndefined();
        expect(items[0].itemTypeAttributeDisplayAbbreviation).toBeUndefined();
    });

    it('assigns sequential IDs across properties and vehicles', () => {
        const properties: ApiInvolvedPropertyT[] = [
            { item: { itemDescription: 'P1' } },
            { item: { itemDescription: 'P2' } },
        ];
        const vehicles: ApiInvolvedVehicleT[] = [
            { vehicle: { itemProfile: { itemDescription: 'V1' } } },
        ];

        const items = transformItems(properties, vehicles, createIdGenerator());

        expect(items[0].id).toBe('10001');
        expect(items[1].id).toBe('10002');
        expect(items[2].id).toBe('10003');
    });
});

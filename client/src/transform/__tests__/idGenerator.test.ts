import { describe, it, expect } from 'vitest';
import { createIdGenerator } from '../idGenerator';

describe('createIdGenerator', () => {
    it('starts at the default start ID (10001)', () => {
        const nextId = createIdGenerator();
        expect(nextId()).toBe('10001');
        expect(nextId()).toBe('10002');
        expect(nextId()).toBe('10003');
    });

    it('accepts a custom start ID', () => {
        const nextId = createIdGenerator(500);
        expect(nextId()).toBe('500');
        expect(nextId()).toBe('501');
    });

    it('returns string IDs', () => {
        const nextId = createIdGenerator();
        const id = nextId();
        expect(typeof id).toBe('string');
    });
});

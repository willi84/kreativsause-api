import { createExtraEventItem, expandExtraEvent } from './api';

describe('createExtraEventItem()', () => {
    it('should use title and location from sheet data', () => {
        const result = createExtraEventItem(
            {
                id: 'dorfkino',
                title: 'Dorfkino "U are the Universe"',
                frequency: 'once',
                status: 'active',
                location: 'Outdoor',
                start: '2026-07-08T21:00:00.000Z',
                end: '2026-07-08T23:00:00.000Z',
            },
            '2026-07-08T21:00:00.000Z',
            '2026-07-08T23:00:00.000Z'
        );

        expect(result).toEqual({
            id: 'dorfkino',
            title: 'Dorfkino "U are the Universe"',
            start: '2026-07-08T21:00:00.000Z',
            end: '2026-07-08T23:00:00.000Z',
            year: '2026',
            category: ['mittwoch 2026'],
            venue: ['Outdoor'],
            changes: [],
            sections: ['extra_event'],
            warnings: [],
            speaker_image: '',
            speakers: [],
            days: ['mittwoch'],
            description: [],
            tags: [],
        });
    });
});

describe('expandExtraEvent()', () => {
    it('should expand daily events to one item per day with adjusted dates', () => {
        const result = expandExtraEvent({
            id: 'mittag',
            title: 'Mittag',
            frequency: 'daily',
            status: 'active',
            location: 'Essenszelt',
            start: '2026-07-07T13:00:00.000Z',
            end: '2026-07-12T14:00:00.000Z',
        });

        expect(result).toHaveLength(6);
        expect(result[0]).toMatchObject({
            id: 'mittag-2026-07-07',
            title: 'Mittag',
            start: '2026-07-07T13:00:00.000Z',
            end: '2026-07-07T14:00:00.000Z',
            days: ['dienstag'],
            venue: ['Essenszelt'],
        });
        expect(result[5]).toMatchObject({
            id: 'mittag-2026-07-12',
            title: 'Mittag',
            start: '2026-07-12T13:00:00.000Z',
            end: '2026-07-12T14:00:00.000Z',
            days: ['sonntag'],
            venue: ['Essenszelt'],
        });
    });
});

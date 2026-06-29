import { getDays } from './workshop.config';

describe('getDays()', () => {
    it('should return an array of days', () => {
        const result = getDays();
        expect(result).toEqual([
            'montag',
            'dienstag',
            'mittwoch',
            'donnerstag',
            'freitag',
            'samstag',
            'sonntag',
        ]);
    });
});

import { checkCatAgainstDays } from './linting';

describe('checkCatAgainstDays()', () => {
    const FN = checkCatAgainstDays;
    it('should return true if all days are included in category', () => {
        const categories = ['Montag 2026', 'Veranstaltungstag 2026'];
        const days = ['montag'];
        expect(FN(categories, days).isValid).toBe(true);
    });
    it('should return false if any day is not included in category', () => {
        const categories = ['Montag 2026', 'Veranstaltungstag 2026'];
        const days = ['dienstag'];
        expect(FN(categories, days)).toEqual({
            isValid: false,
            warnings: [`Day dienstag is not included in category`],
        });
    });
});

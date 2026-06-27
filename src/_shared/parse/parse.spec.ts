import { getDateDetail, getImages, getDateParts, getParts, getDaysFromCategory, getYearFromCategory } from './parse';

describe('getDateParts()', () => {
    const FN = getDateParts;
    it('should return time parts', () => {
        const start = '3:30 p.m.`';
        const end = '5:00 p.m.';
        expect(FN(`${start} - ${end}`)).toEqual({ start, end });
        expect(FN(` ${start} - ${end} `)).toEqual({ start, end });
        expect(FN(`${start}`)).toEqual({ start, end: '' });
        expect(FN(` - ${end}`)).toEqual({ start: '', end });
        expect(FN(``)).toEqual({ start: '', end: '' });

    });
});
describe('getDateDetail()', () => {
    const FN = getDateDetail;
    it('should return date and time parts', () => {
        const date = 'Juli 6';
        const time = '3:30 p.m.';
        expect(FN(`${date} - ${time}`)).toEqual({ date, time });
        expect(FN(`${date}`)).toEqual({ date, time: '' });
        expect(FN(` - ${time}`)).toEqual({ date: '', time });
        expect(FN(``)).toEqual({ date: '', time: '' });

    });
});
describe('getImages()', () => {
    const FN = getImages;
    it('should return image srcs', () => {
        const html = `
            <div>
                <img src="image1.jpg" />
                <img src="image2.jpg" />
                <img src="image3.jpg" />
            </div>
        `;
        const root = document.createElement('div');
        root.innerHTML = html;
        expect(FN(root)).toEqual(['image1.jpg', 'image2.jpg', 'image3.jpg']);
    });
    it('should return empty array if no images', () => {
        const html = `
            <div>
                <p>No images here</p>
            </div>
        `;
        const root = document.createElement('div');
        root.innerHTML = html;
        expect(FN(root)).toEqual([]);
    });
});
describe('getParts()', () => {
    const FN = getParts;
    it('should return parts of a string', () => {
        const value = 'part1, part2, part3';
        const delimiter = ',';
        expect(FN(value, delimiter)).toEqual(['part1', 'part2', 'part3']);
        expect(FN(` ${value} `, delimiter)).toEqual(['part1', 'part2', 'part3']);
        expect(FN(``, delimiter)).toEqual([]);
    });
});
describe('getDaysFromCategory()', () => {
    const FN = getDaysFromCategory;
    it('should return days from category', () => {
        const category = ['Montag 2026', 'Veranstaltungstag 2026'];
        expect(FN(category)).toEqual(['montag']);
        expect(FN([])).toEqual([]);
        expect(FN(['Dienstag 2026'])).toEqual(['dienstag']);
        expect(FN(['MittwOch 2026'])).toEqual(['mittwoch']);
        expect(FN(['Donnerstag 2026'])).toEqual(['donnerstag']);
        expect(FN(['FreITag 2026'])).toEqual(['freitag']);
        expect(FN(['Samstag 2026'])).toEqual(['samstag']);
        expect(FN(['Sonntag 2026'])).toEqual(['sonntag']);
    });
});
describe('getYearFromCategory()', () => {
    const FN = getYearFromCategory;
    it('should return year from category', () => {
        const category = ['Montag 2026', 'Veranstaltungstag 2026'];
        expect(FN(category)).toEqual('2026');
        expect(FN([])).toEqual('');
        expect(FN(['Montag 2025', 'Veranstaltungstag 2026'])).toEqual('2025');
        expect(FN(['Montag 2026', 'Veranstaltungstag 2025'])).toEqual('2026');
    });
});
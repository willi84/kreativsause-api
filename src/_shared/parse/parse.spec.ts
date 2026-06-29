import { getKey } from '../sanitize/sanitize';
import {
    getImages,
    getDateParts,
    getParts,
    getDaysFromCategory,
    getYearFromCategory,
    getDescription,
    getAuthors,
    getTime,
    getVenue,
} from './parse';

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
describe('getImages()', () => {
    const FN = getImages;
    it('should return image srcs', () => {
        const html = `
            <div>
                <article>
                    <img src="image1.jpg" />
                    <img src="image2.jpg" />
                    <img src="image3.jpg" />
                </article>
            </div>
                <img src="image4.jpg" />
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
        expect(FN(` ${value} `, delimiter)).toEqual([
            'part1',
            'part2',
            'part3',
        ]);
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
describe('getDescription()', () => {
    const FN = getDescription;
    const html = `<div class="entry-content">
        <p>Ich bin ein Text</p>
        <p> </p>
        <p>Ich bin ein weiterer Text</p>
        <p class="iee_event_meta">Ich bin ein Meta-Text</p>
        <p class="iee_event_image">Ich bin ein Bild-Text</p>
        <p> Der Workshop wird veranstaltet von Robert Willemelis</p>
        <p>Bitte reserviere Dir nur dann einen Platz</p>
        <p>DIESER TEXT DARF NICHT ERSCHEINEN</p>
    </div>`;
    const root = document.createElement('div');
    root.innerHTML = html;
    const result = FN(root);
    it('should return description paragraphs', () => {
        expect(result).toEqual([
            'Ich bin ein Text',
            'Ich bin ein weiterer Text',
            'Der Workshop wird veranstaltet von Robert Willemelis',
        ]);
    });
});

describe('getAuthors()', () => {
    const FN = getAuthors;
    it('should return author from items', () => {
        const items = [
            'Veranstaltet von Robert Willemelis',
            'Angeleitet von Max Mustermann',
            'Gestaltet von John Doe',
            'Geleitet von Jane Doe',
        ];
        expect(FN(['Angeleitet von Max Mustermann'])).toEqual([
            'Max Mustermann',
        ]);
        expect(FN(['Gestaltet von John Doe'])).toEqual(['John Doe']);
        expect(FN(['Gestaltet von John Doe und Jane Doe'])).toEqual([
            'John Doe',
            'Jane Doe',
        ]);
        expect(FN(['Geleitet von Jane Doe'])).toEqual(['Jane Doe']);
        expect(FN(['Keine Angabe'])).toEqual([]);
        expect(FN(items)).toEqual([
            'Robert Willemelis',
            'Max Mustermann',
            'John Doe',
            'Jane Doe',
        ]);
    });
});
describe('getKey()', () => {
    const FN = getKey;
    it('should return key from text', () => {
        expect(FN('heute: ein Key ')).toEqual('heute_ein_key');
        expect(FN('<p>heute:</p> ein Key ')).toEqual('heute_ein_key');
    });
});
describe('getTime()', () => {
    const FN = getTime;
    it('should return time in 24h format', () => {
        expect(FN('3:30 p.m.')).toEqual('15:30');
        expect(FN('5:00 p.m.')).toEqual('17:00');
        expect(FN('12:00 a.m.')).toEqual('00:00');
        expect(FN('12:00 p.m.')).toEqual('12:00');
        expect(FN('1:00 a.m.')).toEqual('01:00');
        expect(FN('1:00 p.m.')).toEqual('13:00');
        expect(FN('3:00')).toEqual('03:00');
        expect(FN('13:00')).toEqual('13:00');
    });
});
describe('getVenue()', () => {
    const FN = getVenue;
    it('should return venue details', () => {
        const location = 'COCONAT - a workation retreat im Gutshof Glien';
        const address =
            'Klein-Glien 25, 14806 Bad BelzigBad Belzig, BB, DE, 14806';
        const html = `
            <div class="venue">
                <p>${location}</p>
                <p>${address}</p>
            </div>
        `;
        const root = document.createElement('div');
        root.innerHTML = html;
        expect(FN(root, '.venue')).toEqual([location, address]);
    });
});

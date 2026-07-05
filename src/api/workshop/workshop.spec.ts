import { FS } from './../../_shared/fs/fs';
import { analyzeWorkshopPage } from './workshop';
describe('analyzeWorkshopPage()', () => {
    const FN = analyzeWorkshopPage;
    it('should return workshop details', () => {
        const html = FS.readFile(__dirname + '/mocks/sample.html');
        const EXPECTED = {
            sections: [
                'date',
                'time',
                'event_category',
                'event_tags',
                'click_to_register',
            ],
            warnings: [],
            speakers: ['´Zukunftszentrum Brandenburg'], // TODO: richtig?
            speaker_image:
                'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1186138027%2F466620722581%2F1%2Foriginal.20260604-092030?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=b6eaf4b2a3fb8a83c2bd6e291c75c043',
            category: ['Montag 2026', 'Veranstaltungstag 2026'],
            id: 'sample',
            title: 'sampleTitle',
            start: '2026-07-06T15:30:00.000Z',
            end: '2026-07-06T17:00:00.000Z',
            days: ['montag'],
            year: '2026',
            tags: [
                'Erwachsene',
                'Gesellschaft und Teilhabe',
                'Mensch & Gesellschaft',
                'Mensch & Natur',
                'Nachhaltigkeit',
                'Neues Arbeiten und Leben',
            ],
            register:
                'https://www.eventbrite.de/e/kleine-stupser-groe-wirkung-durch-green-nudging-registrierung-1990561749778',
            images: [
                'https://flaeminger.kreativsause.de/wp-content/uploads/2026/06/10191_image-1-1024x738.png',
                'https://flaeminger.kreativsause.de/wp-content/uploads/2026/06/10191_image-1.png',
                'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1186138027%2F466620722581%2F1%2Foriginal.20260604-092030?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=b6eaf4b2a3fb8a83c2bd6e291c75c043',
                'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F758909869%2F317817383889%2F1%2Foriginal.20240503-144830?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=56886f368d922258e2acb40e3ecf2465',
                'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F758910769%2F317817383889%2F1%2Foriginal.20240503-144938?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=02292ac7a7ba780f28803a6946753e43',
            ],
            venue: [
                'COCONAT - a workation retreat im Gutshof Glien',
                'Klein-Glien 25, 14806 Bad BelzigBad Belzig, BB, DE, 14806',
            ],
            description: [
                'Mit dem Zukunftszentrum Brandenburg Ideen für nachhaltiges Verhalten entwickeln',
                'Mit dem Zukunftszentrum Brandenburg Ideen für nachhaltiges Verhalten entwickeln',
                'Wie können wir nachhaltiges Verhalten einfacher, attraktiver und selbstverständlicher machen?',
                'Genau hier setzt Green Nudging an, ein Ansatz aus der Verhaltenswissenschaft, der dabei hilft, umweltfreundliche Entscheidungen gezielt zu unterstützen.',
                'In diesem Workshop wirst du selbst zur Gestalter*in! Gemeinsam mit anderen Teilnehmenden entwickelst du kreative Green Nudges, die Menschen im Alltag zu nachhaltigeren Entscheidungen anregen. Ob im Supermarkt, im Büro oder im öffentlichen Raum, es entstehen praxisnahe Ideen, die sich direkt auf reale Situationen übertragen lassen.',
                'Der Workshop bietet einen Einstieg in das Thema und lebt vom gemeinsamen Ausprobieren, Diskutieren und Weiterdenken. Vorkenntnisse sind nicht erforderlich.',
                'Dieser Workshop wird gestaltet von ´Zukunftszentrum Brandenburg.', // TODO: Fehler
                'Unter dem Motto „Arbeit zusammen gestalten“ unterstützt das Zukunftszentrum Brandenburg Betriebe aller Branchen im demografischen, digitalen und ökologischen Wandel. Die Angebote richten sich vorwiegend an kleine und mittlere Unternehmen (KMU) in ländlichen Regionen, die erste Schritte in den Bereichen Nachhaltigkeit, Digitalisierung oder der Organisationsentwicklung gehen und vor spezifischen Herausforderungen der Fachkräftesicherung stehen.',
                'Dank Förderung ist die Beratung kostenlos.',
                'www.zukunftszentrum-brandenburg.de',
            ],
            links: [
                {
                    href: 'https://www.zukunftszentrum-brandenburg.de/',
                    text: 'www.zukunftszentrum-brandenburg.de',
                },
            ],
        };
        const result = FN(html as string, {
            id: 'sample',
            title: 'sampleTitle',
            href: 'https://flaeminger.kreativsause.de/programm-2026/sample/',
        });
        expect(result).toEqual(EXPECTED);
    });
});

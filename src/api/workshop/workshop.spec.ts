import { FS } from './../../_shared/fs/fs';
import { analyzeWorkshopPage } from './workshop';
describe('analyzeWorkshopPage()', () => {
    const FN = analyzeWorkshopPage;
    it('should return workshop details', () => {
        const html = FS.readFile( __dirname + '/mocks/sample.html');
        const EXPECTED = {
            sections: [ 'date', 'time', 'event category', 'event tags', 'click to register' ],
            warnings: [],
            speakers: [],
            category: [ 'Montag 2026', 'Veranstaltungstag 2026' ],
            id: 'sample',
            title: 'sampleTitle',
            startDate: 'Juli 6',
            endDate: 'Juli 6',
            startTime: '3:30 p.m.',
            endTime: '5:00 p.m.',
            days: [ 'montag' ],
            year: '2026',
            tags: [
            'Erwachsene',
            'Gesellschaft und Teilhabe',
            'Mensch & Gesellschaft',
            'Mensch & Natur',
            'Nachhaltigkeit',
            'Neues Arbeiten und Leben'
            ],
            register: 
            'https://www.eventbrite.de/e/kleine-stupser-groe-wirkung-durch-green-nudging-registrierung-1990561749778',
    images: [
      'https://flaeminger.kreativsause.de/wp-content/uploads/2020/02/logo_2E3092.svg.svg',
      'https://flaeminger.kreativsause.de/wp-content/uploads/2020/02/logo_2E3092.svg.svg',
      'https://flaeminger.kreativsause.de/wp-content/uploads/2026/06/10191_image-1-1024x738.png',
      'https://flaeminger.kreativsause.de/wp-content/uploads/2026/06/10191_image-1.png',
      'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1186138027%2F466620722581%2F1%2Foriginal.20260604-092030?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=b6eaf4b2a3fb8a83c2bd6e291c75c043',
      'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F758909869%2F317817383889%2F1%2Foriginal.20240503-144830?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=56886f368d922258e2acb40e3ecf2465',
      'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F758910769%2F317817383889%2F1%2Foriginal.20240503-144938?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=02292ac7a7ba780f28803a6946753e43',
      'https://flaeminger.kreativsause.de/wp-content/uploads/2026/06/Ankerpunkt_beschriftet_Transparent-1024x567.png'
    ],
    venue: [
      'COCONAT - a workation retreat im Gutshof Glien',
      'Klein-Glien 25, 14806 Bad BelzigBad Belzig, BB, DE, 14806'
    ],
    description: [],
    links: []
  };
        const result = FN(html as string, { id: 'sample', title: 'sampleTitle'});
        expect(result).toEqual(EXPECTED);
    });
});
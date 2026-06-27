import { removeHtmlTags } from './sanitize';
describe('removeHtmlTags()', () => {
    const FN = removeHtmlTags;
    it('should remove html tags from a string', () => {
        const htmlString = '<p>Hello, <strong>World!</strong></p>';
        const result = FN(htmlString);
        expect(result).toEqual('Hello, World!');
    });
    it('should return an empty string when input is null', () => {
        const result = FN(null as unknown as string);
        expect(result).toEqual('');
    });
});
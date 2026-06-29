import { getKey, getStrValue, removeHtmlTags, sanitizeText } from './sanitize';
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
describe('getKey()', () => {
    const FN = getKey;
    it('should return the key id', () => {
        expect(FN('Date:')).toEqual('date');
        expect(FN(' Time: to')).toEqual('time_to');
        expect(FN(' <p>Time:</p> to')).toEqual('time_to');
    });
});
describe('getStrValue()', () => {
    const FN = getStrValue;
    it('should return the trimmed string value', () => {
        expect(FN('  Hello World  ')).toEqual('Hello World');
        expect(FN(undefined)).toEqual('');
    });
});
describe('sanitizeText()', () => {
    const FN = sanitizeText;
    it('should sanitize text by removing html tags, newlines, and tabs', () => {
        expect(FN('<p>Hello\nWorld\t!</p>')).toEqual('HelloWorld!');
        expect(FN('  <div>   Test   </div>  ')).toEqual('Test');
        expect(FN('')).toEqual('');
    });
});

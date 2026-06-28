/**
 * 🎯 strip html tags from html
 * @param {string} htmlString - the html string to strip
 * @returns {string} - the stripped string
 */

export const removeHtmlTags = (htmlString: string) => {
    if (!htmlString) {
        return '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
}

export const getKey = (text: string) => {
    return removeHtmlTags(text)
        .replace(/:/g, '')
        .toLowerCase().trim()
        .replace(/\s/g, '_'); // important: after trim()
}
export const getStrValue = (value: string | undefined) => {
    return value ? value.trim() : '';
}
export const sanitizeText = (text: string) => {
    return removeHtmlTags(text)
            .replace(/\n/g, '').trim()
            .replace(/\t/g, '').trim()
}
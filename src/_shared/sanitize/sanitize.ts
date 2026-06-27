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
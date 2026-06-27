import { getDays } from '../../api/workshop/workshop.config';

const DAYS = getDays();
export const getParts = (value: string, delimiter: string) => {
    const parts = value ? value.split(delimiter) : [];
    const result = parts.map((part: string) => part.trim());
    return result;
}
export const getDateParts = (value: string) => {
    const partsTime = getParts(value, '-');
    const start = partsTime[0] ? partsTime[0] : '';
    const end = partsTime[1] ? partsTime[1] : '';
    return { start, end };
}
export const getDateDetail = (value: string) => {
    const startParts = getParts(value, '-');
    const date = startParts[0] ? startParts[0] : '';
    const time = startParts[1] ? startParts[1] : '';
    return { date, time };
};
export const getImages = (root: HTMLElement) => {
    const images = root.querySelectorAll('img');
    const result = [];
    for (const image of images) {
        const src = image.getAttribute('src');
        if (src) {
            result.push(src);
        }
    }
    return result;
}
export const getDaysFromCategory = (category: string[]) => {
    const days: string[] = [];
    for (const cat of category) {
       for (const day of DAYS) {
            if (cat.toLowerCase().indexOf(day) !== -1) {
                days.push(day);
            }
        }
    }
    return days;
}
export const getYearFromCategory = (category: string[]) => {
    let year = '';
    for (const cat of category) {
        const yearMatch = cat.match(/\d{4}/);
        if (yearMatch && yearMatch.length > 0) {
            year = yearMatch[0];
            break;
        }
    }
    return year;
}
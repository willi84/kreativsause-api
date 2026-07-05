import { PHRASES } from '../../api/api.config';
import type { PARAGRAF } from '../../api/api.d';
import { getDays } from '../../api/workshop/workshop.config';
import { removeHtmlTags, sanitizeText } from '../sanitize/sanitize';
import type { DATE } from './parse.d';

const DAYS = getDays();
export const getParts = (value: string, delimiter: string) => {
    const parts = value ? value.split(delimiter) : [];
    const result = parts.map((part: string) => part.trim());
    return result;
};
// base
export const getStartEnd = (value: string) => {
    const partsTime = getParts(value, '-');
    const start = partsTime[0] ? partsTime[0] : '';
    const end = partsTime[1] ? partsTime[1] : '';
    return { start, end };
};

export const getDateParts = (value: string) => {
    return getStartEnd(value);
};

export const getImages = (root: HTMLElement) => {
    const images = root.querySelectorAll('article img');
    const result = [];
    for (const image of images) {
        const src = image.getAttribute('src');
        if (src && result.indexOf(src) === -1) {
            result.push(src);
        }
    }
    return result;
};
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
};
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
};

export const getParagrafs = (root: HTMLElement) => {
    const pars = root.querySelectorAll<PARAGRAF>(
        '.entry-content > p, .site-content p'
    );
    const paragraphs = Array.from(pars)
        .filter((el: PARAGRAF) => !el.classList.contains('iee_event_meta'))
        .filter((el: PARAGRAF) => !el.classList.contains('iee_event_image'))
        .filter((el: PARAGRAF) => el.innerHTML.trim().length > 0)
        .filter(
            (el: PARAGRAF) =>
                !el
                    .getAttribute('id')
                    ?.startsWith('iee-eventbrite-checkout-widget')
        );
    let stop = false;
    const result: PARAGRAF[] = [];
    for (const paragraph of paragraphs) {
        const text = removeHtmlTags(paragraph.innerHTML).trim();
        const sign = 'Bitte reserviere Dir nur dann einen Platz';
        if (text.toLowerCase().startsWith(sign.toLowerCase())) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            stop = true;
            break;
        } else {
            result.push(paragraph);
        }
    }
    return result;
};

export const getDescription = (root: HTMLElement) => {
    const result = getParagrafs(root)
        .map((paragraph: PARAGRAF) =>
            removeHtmlTags(paragraph.innerHTML).trim()
        )
        .filter((text: string) => text.trim() !== '');
    return result;
};
export const getLinks = (root: HTMLElement) => {
    const result = [];
    const paragraphs = getParagrafs(root);
    for (const paragraph of paragraphs) {
        const links = paragraph.querySelectorAll('a');
        for (const link of links) {
            const href = link.getAttribute('href');
            const text = link.innerText;
            if (href && text) {
                result.push({ href, text });
            }
        }
    }
    return result;
};

export const updateName = (name: string, result: string[]) => {
    if (name && name !== '') {
        const finalName = name.replace(/[\.|!]*$/, '').trim();
        if (!result.includes(finalName)) {
            result.push(finalName);
        }
    }
};

export const getAuthors = (items: string[]): string[] => {
    const result: string[] = [];
    for (const item of items) {
        for (const phrase of PHRASES) {
            const txt = phrase.replace(/\s/g, '\\s');
            const regexNames = new RegExp(`${txt}\\s(.*)$`, 'i');
            if (item.match(regexNames)) {
                const m = item.match(regexNames);
                if (m && m.length > 1) {
                    const text = m[1].trim();
                    const n = text.match(/und/);
                    if (n && n.length > 0) {
                        const names = text
                            .split('und')
                            .map((name) => name.trim());
                        for (const name of names) {
                            updateName(name, result);
                        }
                    } else {
                        updateName(text, result);
                    }
                }
            }
        }
    }
    return result;
};
export const getTime = (value: string) => {
    const t = new Date(`1970-01-01 ${value.replace(/\./g, '')}`);
    const result = t.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    return result;
};
export const getDate = (day: string, time: string, issues: string[]) => {
    const fullDate = day.replace(/T\d\d:\d\d/, `T${time}`);
    try {
        new Date(fullDate);
    } catch (e: any) {
        issues.push(`invalid date: ${e} [${fullDate}]`);
    }
    return fullDate;
};

export const getDates = (eventDate: DATE) => {
    const issues: string[] = [];
    const start = getDate(eventDate.startDate, eventDate.startTime, issues);
    const end = getDate(eventDate.endDate, eventDate.endTime, issues);
    return { start, end, issues };
};
export const getVenue = (root: HTMLElement, selector: string) => {
    let result: string[] = [];
    const venue = root.querySelector(selector);
    if (venue) {
        const venueText = removeHtmlTags(venue.innerHTML).trim();
        if (venueText) {
            const venueParts = venueText.split(/\n/);
            result = venueParts
                .map((part: string) => sanitizeText(part))
                .filter((part: string) => part.length > 0)
                .filter((part: string) => part.toLowerCase() !== 'venue');
        }
    }
    return result;
};
export const getWeekDays = (dates: string[]): string[] => {
    const result = [];
    for (const date of dates) {
        const weekday = new Date(date)
            .toLocaleDateString('de-DE', {
                weekday: 'long',
            })
            .toLowerCase();
        if (result.indexOf(weekday) === -1) {
            result.push(weekday);
        }
    }
    return result;
};

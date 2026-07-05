import { LOG } from './../../_shared/log/log';
import type { WORKSHOP, WORKSHOP_ITEM } from './workshop.d';
import { command } from '../../_shared/cmd/cmd';
import { getKey, getStrValue } from '../../_shared/sanitize/sanitize';
import { IDS } from './workshop.config';
import type { DATE } from '../../_shared/parse/parse.d';
import {
    getImages,
    getDateParts,
    getParts,
    getDescription,
    getLinks,
    getAuthors,
    getTime,
    getDates,
    getVenue,
    getWeekDays,
} from '../../_shared/parse/parse';
const HTMLParser = require('node-html-parser');

export const getTags = (tags: string[]) => {
    const result: string[] = [];
    for (const tag of tags) {
        const uSplit = tag.split(/\sund\s/);
        for (const uPart of uSplit) {
            const splitted = uPart.split(/[,&]/);
            for (const part of splitted) {
                const str = part.toLowerCase().trim();
                if (!result.includes(str) && str.length > 0) {
                    result.push(str);
                }
            }
        }
    }
    return result;
};

export const getWorkshopDetails = (
    workshop: WORKSHOP,
    id: number,
    all: number
) => {
    // if(!workshop){
    //     LOG.WARN(`[workshop ${id}] is undefined `);

    // }
    const url = workshop?.href;
    const html = command(`curl -s ${url}`);
    if (html.length > 10) {
        LOG.OK(`[${id}/${all}] ${url}`);
    } else {
        LOG.FAIL(`[${id}/${all}] ${url}`);
    }
    return analyzeWorkshopPage(html, workshop);
};

export const analyzeWorkshopPage = (html: string, base: WORKSHOP) => {
    const data: WORKSHOP_ITEM = {
        sections: [],
        warnings: [],
        speakers: [],
        category: [],
        id: base.id,
        title: base.title,
    };
    var root = HTMLParser.parse(html);
    const YEAR = '2026';

    // const remainingTickets = root.querySelector('[data-testid="remaining-tickets-grey"]');
    // console.log(remainingTickets.innerHTML);
    // wait till rendered
    const detailsElement = root.querySelector('.iee_organizermain .details');
    const sections = detailsElement
        ? detailsElement.querySelectorAll('strong')
        : [];
    const eventDate: DATE = {
        year: YEAR,
        startTime: '00:00',
        endTime: '00:00',
        startDate: '',
        endDate: '',
    };
    data.year = YEAR;
    for (const section of sections) {
        const sectionKey = getKey(section.text);
        let found = false;
        for (const key in IDS) {
            if (IDS[key].includes(sectionKey)) {
                found = true;
                data.sections.push(sectionKey);
                if (found) {
                    const valueElement = section.querySelector(' + p, + a');
                    if (!valueElement || !valueElement.text) {
                        LOG.WARN(`No value found for section: ${sectionKey}`);
                        data.warnings.push(
                            `No value found for section: ${sectionKey}`
                        );
                        continue;
                    }
                    const value = valueElement.text.trim();
                    switch (key) {
                        case 'date':
                            // TODO: evt buggy
                            const day = new Date(
                                `${value} ${YEAR} 06:00`
                            ).toISOString(); // set to 6am as default to avoid wrong day
                            eventDate.startDate = day;
                            eventDate.endDate = day;
                            break;
                        case 'time':
                            const timeParts = getDateParts(value);
                            const startTime = getTime(timeParts.start);
                            const endTime = getTime(timeParts.end);
                            eventDate.startTime = startTime;
                            eventDate.endTime = endTime;
                            break;
                        case 'category':
                            data.category = getParts(value, ',');
                            break;
                        case 'tags':
                            const parts = getParts(value, ',');
                            data.tags = getTags(parts);
                            break;
                        case 'register':
                            data.register = getStrValue(value);
                            break;
                        case 'organizer':
                            data.organizer = getStrValue(value);
                            break;
                    }
                }
            }
        }

        if (!found) {
            data.warnings.push(`Section not found: ${sectionKey}`);
            LOG.WARN(`Section not found: ${sectionKey}`);
        }
    }
    data.images = getImages(root);
    const blacklist = [
        'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F758909869%2F317817383889%2F1%2Foriginal.20240503-144830?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=56886f368d922258e2acb40e3ecf2465',
        'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F758910769%2F317817383889%2F1%2Foriginal.20240503-144938?h=740&w=1200&auto=format%2Ccompress&q=75&sharp=10&s=02292ac7a7ba780f28803a6946753e43',
    ];

    data.speaker_image = '';
    const filteredImages = data.images.filter(
        (image) =>
            image.startsWith('https://img.evbuc.com') &&
            blacklist.indexOf(image) === -1
    );
    for (const image of filteredImages) {
        data.speaker_image = image;
        break;
    }

    const dates = getDates(eventDate);
    data.start = dates.start ? dates.start : '';
    data.end = dates.end ? dates.end : '';

    data.days = getWeekDays([data.start, data.end]);

    // data.days = getDaysFromCategory(data.category);
    // data.year = getYearFromCategory(data.category);
    // if (data.days.length === 0) {
    //     LOG.WARN(`No day found in category: ${value}`);
    //     data.warnings.push(`No day found in category: ${value}`);
    // }

    data.venue = getVenue(root, '.iee_organizermain .venue');
    data.description = [];
    data.links = [];
    // TODO: '.entry-content > div > p'
    data.description = getDescription(root);
    if (data.description.length === 0) {
        data.warnings.push('no description found');
    } else {
        LOG.OK(`description found with ${data.description.length} paragraphs`);
    }
    data.links = getLinks(root);
    data.speakers = getAuthors(data.description);
    return data;
};

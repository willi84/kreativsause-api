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

export const getWorkshopDetails = (
    workshop: WORKSHOP,
    id: number,
    all: number
) => {
    const url = workshop.href;
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
                            data.tags = getParts(value, ',');
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
    }
    data.links = getLinks(root);
    data.speakers = getAuthors(data.description);
    return data;
};

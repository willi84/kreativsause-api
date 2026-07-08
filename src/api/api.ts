import { command } from '../_shared/cmd/cmd';
import { FS } from '../_shared/fs/fs';
import { LOG } from '../_shared/log/log';
import { getKey } from '../_shared/sanitize/sanitize';
import { lintData } from './linting/linting';
import { collectItems, getWorkshopDetails } from './workshop/workshop';
import type { ALL_DATA, WORKSHOP } from './api.d';
import type { WORKSHOP_ITEM } from './workshop/workshop.d';
import {
    IS_DEV,
    MAX,
    SHEET_ID,
    SHEET_TAB,
    SHEET_TAB_2,
    START,
} from './api.config';
import { getSheetData, rowToValues } from '../_shared/google/google';

const HTMLParser = require('node-html-parser');

type EXTRA_EVENT = {
    id: string;
    title: string;
    start: string;
    end: string;
    day?: string;
    status?: string;
    location?: string;
    frequency?: string;
};

export const getData = (id: string, tab: string) => {
    const sheetJson = getSheetData(id, tab);
    // console.log(sheetJson);

    const rows = sheetJson.table.rows;

    const keys = rows[0].c.map((col: any) => col.v);
    const result: any = {};
    let index = 0;
    for (const row of rows) {
        if (index > 0) {
            const values = rowToValues(row);
            const item: any = {};
            for (const key of keys) {
                item[key] = values[keys.indexOf(key)];
            }
            result[item.id] = item;
        }
        index++;
    }
    return result;
};

export const getWorkshopLocations = () => {
    return getData(SHEET_ID, SHEET_TAB);
};
export const getExtraEvents = () => {
    return getData(SHEET_ID, SHEET_TAB_2);
};

export const main = () => {
    const locations = getWorkshopLocations();
    const events = getExtraEvents();
    getWorkshopLinks(locations, events);
};
export const getList = (value: string) => {
    const list = (value || '')
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item !== '');
    return list;
};

export const getEventYear = (start: string, end: string) => {
    const startYear = new Date(start).getUTCFullYear();
    const endYear = new Date(end).getUTCFullYear();
    return `${startYear || endYear || ''}`;
};

export const getEventDay = (value: string) => {
    return new Date(value)
        .toLocaleDateString('de-DE', {
            weekday: 'long',
            timeZone: 'UTC',
        })
        .toLowerCase();
};

export const createEventDate = (baseDate: Date, timeDate: Date) => {
    const result = new Date(baseDate);
    result.setUTCHours(
        timeDate.getUTCHours(),
        timeDate.getUTCMinutes(),
        timeDate.getUTCSeconds(),
        timeDate.getUTCMilliseconds()
    );
    return result.toISOString();
};

export const createExtraEventItem = (
    event: EXTRA_EVENT,
    start: string,
    end: string,
    id = event.id
): WORKSHOP_ITEM => {
    const year = getEventYear(start, end);
    const day = getEventDay(start);
    const category = [`${day} ${year}`];
    const changes = getList(event.status || '').filter(
        (item: string) => item !== 'active'
    );
    return {
        id,
        title: event.title,
        start,
        end,
        year,
        category,
        venue: getList(event.location || ''),
        changes,
        sections: ['extra_event'],
        warnings: [],
        speaker_image: event.speaker_image || '',
        speakers: getList(event.speakers || ''),
        days: [day],
        description: [],
        tags: getList(event.tags || ''),
    };
};

export const expandExtraEvent = (event: EXTRA_EVENT): WORKSHOP_ITEM[] => {
    if (!event.start || !event.end || !event.id || !event.title) {
        return [];
    }
    if (event.frequency !== 'daily') {
        return [createExtraEventItem(event, event.start, event.end)];
    }
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const currentDate = new Date(
        Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate()
        )
    );
    const lastDate = new Date(
        Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate()
        )
    );
    const result: WORKSHOP_ITEM[] = [];
    while (currentDate.getTime() <= lastDate.getTime()) {
        const start = createEventDate(currentDate, startDate);
        const end = createEventDate(currentDate, endDate);
        const dateId = currentDate.toISOString().split('T')[0];
        result.push(
            createExtraEventItem(event, start, end, `${event.id}-${dateId}`)
        );
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return result;
};

export const getExtraEventItems = (
    extraEvents: Record<string, EXTRA_EVENT>
) => {
    const result: WORKSHOP_ITEM[] = [];
    for (const event of Object.values(extraEvents || {})) {
        result.push(...expandExtraEvent(event));
    }
    return result;
};

export const getWorkshopLinks = (manualData: any, extraEvents: any) => {
    const workshops: WORKSHOP[] = [];
    const url = 'https://flaeminger.kreativsause.de/programm-2026/';
    const data: ALL_DATA = {
        generated: new Date().toISOString(),
        meta: {
            tags: {},
            categories: {},
            images: {},
            speakers: {},
            links: {},
        },
        workshops: {},
    };
    const html = command(`curl -s ${url}`);
    if (html.length < 10) {
        LOG.FAIL('could not reach program page');
    } else {
        LOG.OK('start parsing workshops');
        const root = HTMLParser.parse(html);
        const links = root.querySelectorAll('article a');
        for (const link of links) {
            const href = link.getAttribute('href');
            const title = link.innerHTML;
            const urlItems = href
                .split('/')
                .filter((item: string) => item.trim() !== '');
            const id = getKey(urlItems[urlItems.length - 1]);
            const workshop = { href, title, id, source: url };
            const str = title.toLowerCase().trim();
            if (str.indexOf('mehr...') !== -1 || str === '') {
            } else if (workshops.indexOf(workshop) === -1) {
                workshops.push(workshop);
            }
        }
        const max = IS_DEV && MAX > -1 ? MAX : workshops.length;
        for (let i = START; i < max; i++) {
            const workshop = workshops[i];
            const id = i + 1;
            const details = getWorkshopDetails(workshop, id, max);
            const dataItem = manualData[details.id];
            if (dataItem) {
                details.venue = getList(dataItem.location);
                const filterOut = ['active'];
                const logs = getList(dataItem.status).filter(
                    (item: string) => !filterOut.includes(item)
                );
                details.changes = logs;
            }
            // details['source'] = workshop['source'];

            // get Tags
            collectItems(details.tags, data.meta.tags);
            collectItems(details.category, data.meta.categories);
            collectItems(details.images, data.meta.images);
            collectItems(details.speakers, data.meta.speakers);
            const links = details.links?.map((link) => link.href);
            collectItems(links, data.meta.links);

            LOG.DEBUG(JSON.stringify(workshop));
            const noDuplicate = !data.workshops[workshop.id];
            if (!noDuplicate) {
                LOG.WARN(`workshop with ${id} is duplicated`);
            }
            lintData(details);
            if (noDuplicate) {
                data.workshops[workshop.id] = details;
            }
        }
    }
    const extraEventItems = getExtraEventItems(extraEvents);
    for (const extraEvent of extraEventItems) {
        const noDuplicate = !data.workshops[extraEvent.id];
        if (!noDuplicate) {
            LOG.WARN(`extra event with id ${extraEvent.id} is duplicated`);
            continue;
        }
        lintData(extraEvent);
        data.workshops[extraEvent.id] = extraEvent;
    }
    FS.writeFile('./workshops.json', JSON.stringify(data, null, 2));
};

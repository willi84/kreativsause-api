import { command } from '../_shared/cmd/cmd';
import { FS } from '../_shared/fs/fs';
import { LOG } from '../_shared/log/log';
import { getKey } from '../_shared/sanitize/sanitize';
import { lintData } from './linting/linting';
import { collectItems, getWorkshopDetails } from './workshop/workshop';
import type { ALL_DATA, WORKSHOP } from './api.d';
import { IS_DEV, MAX, SHEET_ID, SHEET_TAB, START } from './api.config';
import { getSheetData, rowToValues } from '../_shared/google/google';

const HTMLParser = require('node-html-parser');

export const getWorkshopLocations = () => {
    const sheetJson = getSheetData(SHEET_ID, SHEET_TAB);
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

export const main = () => {
    const locations = getWorkshopLocations();
    getWorkshopLinks(locations);
};

export const getWorkshopLinks = (locations: any) => {
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
            if (locations[details.id]) {
                details.venue = locations[details.id].location
                    .split(',')
                    .map((item: string) => item.trim());
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
    // console.log(workshops);
    FS.writeFile('./workshops.json', JSON.stringify(data, null, 2));
};

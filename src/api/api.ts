import { command } from '../_shared/cmd/cmd';
import { FS } from '../_shared/fs/fs';
import { LOG } from '../_shared/log/log';
import { getKey } from '../_shared/sanitize/sanitize';
import { lintData } from './linting/linting';
import { getWorkshopDetails } from './workshop/workshop';
import type { ALL_DATA, WORKSHOP } from './api.d';
import { IS_DEV, MAX, START } from './api.config';

const HTMLParser = require('node-html-parser');
export const main = () => {
    getWorkshopLinks();
};

export const getWorkshopLinks = () => {
    const workshops: WORKSHOP[] = [];
    const url = 'https://flaeminger.kreativsause.de/programm-2026/';
    const html = command(`curl -s ${url}`);
    const root = HTMLParser.parse(html);
    const links = root.querySelectorAll('article a');
    for (const link of links) {
        const href = link.getAttribute('href');
        const title = link.innerHTML;
        const urlItems = href
            .split('/')
            .filter((item: string) => item.trim() !== '');
        const id = getKey(urlItems[urlItems.length - 1]);
        const workshop = { href, title, id };
        const str = title.toLowerCase().trim();
        if (str.indexOf('mehr...') !== -1 || str === '') {
        } else if (workshops.indexOf(workshop) === -1) {
            workshops.push(workshop);
        }
    }
    const data: ALL_DATA = {
        generated: new Date().toISOString(),
        workshops: {},
    };
    const max = IS_DEV && MAX > -1 ? MAX : workshops.length;
    for (let i = START; i < max; i++) {
        const workshop = workshops[i];
        const details = getWorkshopDetails(workshop, i + 1, max);
        const noDuplicate = !data.workshops[workshop.id];
        if (!noDuplicate) {
            LOG.WARN(`workshop with ${workshop.id} is duplicated`);
        }
        lintData(details);
        if (noDuplicate) {
            data.workshops[workshop.id] = details;
        }
    }
    // console.log(workshops);
    FS.writeFile('./workshops.json', JSON.stringify(data, null, 2));
};

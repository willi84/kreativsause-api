import { command } from '../_shared/cmd/cmd';
import { FS } from '../_shared/fs/fs';
import { LOG } from '../_shared/log/log';
import { getKey } from '../_shared/sanitize/sanitize';
import { getWorkshopDetails } from './workshop/workshop';

const HTMLParser = require('node-html-parser');
export const main = () => {
    console.log('run main');
    getWorkshopLinks();
}

type WORKSHOP = { href: string, title: string, id: string }

const IS_DEV = false;

export const getWorkshopLinks = () => {
    const workshops: WORKSHOP[] = [];
    const url = 'https://flaeminger.kreativsause.de/programm-2026/';
    const html = command(`curl -s ${url}`);
    const root = HTMLParser.parse(html);
    const links = root.querySelectorAll('article a');
    for(const link of links){
        const href = link.getAttribute('href');
        const title = link.innerHTML;
        const urlItems = href.split('/').filter(item => item.trim() !== '');
        const id = getKey(urlItems[urlItems.length - 1 ]);
        const workshop = { href, title, id }
        const str = title.toLowerCase().trim();
        if(str.indexOf('mehr...') !== -1 || str === ''){

        } else if(workshops.indexOf(workshop) === -1){
            workshops.push(workshop);

        }
    }
    const data = {
        workshops: {}
    }
    const max = IS_DEV ? 20 : workshops.length;
    for(let i = 0; i < workshops.length; i++){
        const workshop = workshops[i];
        const details = getWorkshopDetails(workshop, i + 1, max);
        if(!data.workshops[workshop.id]){
            data.workshops[workshop.id] = details;
        } else {
            LOG.FAIL(`workshop with ${workshop.id} is duplicated`)
        }
    }
    // console.log(workshops);
    FS.writeFile('./workshops.json', JSON.stringify(data, null, 2));
}
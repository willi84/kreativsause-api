import { LOG } from './../../_shared/log/log';
import type { WORKSHOP_BASE, WORKSHOP_ITEM } from './workshop.d';
import  { command } from '../../_shared/cmd/cmd';
import { removeHtmlTags } from '../../_shared/sanitize/sanitize';
import { getDays, IDS } from './workshop.config';
import { getDateDetail, getImages, getDateParts, getParts, getDaysFromCategory, getYearFromCategory } from '../../_shared/parse/parse';
const HTMLParser = require('node-html-parser');

const DAYS = getDays();

export const getWorkshopDetails = (url: string, base: WORKSHOP_BASE) => {
    const html = command(`curl -s ${url}`);
    LOG.DEBUG(url);
    return analyzeWorkshopPage(html, base);
}

export const analyzeWorkshopPage = (html: string, base: WORKSHOP_BASE) => {
    const data: WORKSHOP_ITEM = {
        sections: [],
        warnings: [],
        speakers: [],
        category: [],
        id: base.id,
        title: base.title,
    }
    // const html = command(`curl -s ${url}`);
    var root = HTMLParser.parse(html);
    // wait till rendered
    const detailsElement = root.querySelector('.iee_organizermain .details');
    const sections  = detailsElement ? detailsElement.querySelectorAll('strong') : [];
    for (const section of sections) {
        const sectionTitle = removeHtmlTags(section.text).replace(/:/g, '').toLowerCase().trim();
        let found = false;
        for(const key in IDS) {
            if (IDS[key].includes(sectionTitle)) {
                found = true;
                data.sections.push(sectionTitle);
                if(found){
                    const valueElement = section.querySelector(' + p, + a');
                    if(!valueElement || !valueElement.text) {
                        LOG.WARN(`No value found for section: ${sectionTitle}`);
                        data.warnings.push(`No value found for section: ${sectionTitle}`);
                        continue;
                    }
                    const value = valueElement.text.trim();
                    switch (key) {
                        case 'date':
                            // data.date = section.nextSibling ? section.nextSibling.text.trim() : '';
                            data.startDate = value; // Assuming start date is the same as date
                            data.endDate = value; // Assuming end date is the same as date
                            break;
                        case 'time':
                            const timeParts = getDateParts(value);
                            data.startTime = timeParts.start;
                            data.endTime = timeParts.end;
                            break;
                        case 'start':
                            const startParts = getDateDetail(value);
                            data.startDate = startParts.date;
                            data.startTime = startParts.time;
                            break;
                        case 'end':
                            const endParts = getDateDetail(value);
                            data.endDate = endParts.date;
                            data.endTime = endParts.time;
                            break;
                        case 'category':
                            data.category = getParts(value, ',');
                            data.days = getDaysFromCategory(data.category);
                            data.year = getYearFromCategory(data.category);
                            if (data.days.length === 0) {
                                LOG.WARN(`No day found in category: ${value}`);
                                data.warnings.push(`No day found in category: ${value}`);
                            }
                            break;
                        case 'tags':
                            const tagsParts = value ? value.split(',') : [];
                            data.tags = tagsParts.map((tag: string) => tag.trim());
                            break;
                        case 'register':
                            data.register = value ? value.trim() : '';
                            break;
                        case 'organizer':
                            data.organizer = value ? value.trim() : '';
                            break;
                    }
                }
            }
        }
        if (!found) {
            data.warnings.push(`Section not found: ${sectionTitle}`);
            LOG.WARN(`Section not found: ${sectionTitle}`);
        }
    }
    data.images = getImages(root);

    const venue = root.querySelector('.iee_organizermain .venue');
    if (venue) {
        const venueText = removeHtmlTags(venue.innerHTML).trim();
        if (venueText) {
            const venueParts = venueText.split(/\n/);
            data.venue = venueParts.map(part => part.replace(/\\t/g, '').trim())
                .filter(part => part.length > 0)
                .filter(part => part.toLowerCase() !== 'venue');
        }
    }
    data.description = [];
    data.links = [];
    // TODO
    const descriptionElements = root.querySelectorAll('.entry-content > div')
                .filter((el: HTMLElement) => el.innerText.trim().length > 0 )
                .filter((el: HTMLElement) => !el.classList.contains('iee_event_meta'))
                .filter((el: HTMLElement) => !el.getAttribute('id')?.startsWith('iee-eventbrite-checkout-widget'));
    for (const descElement of descriptionElements) {
        const paragraphs = descElement.querySelectorAll('p');
        let stop = false;
        for (const paragraph of paragraphs) {
            const text = removeHtmlTags(paragraph.innerHTML).trim();
            const sign = 'Bitte reserviere Dir nur dann einen Platz'
            if(text.toLowerCase().startsWith(sign.toLowerCase())) {
                stop = true;
                break;
            }
            const hasLinks = paragraph.querySelectorAll('a');
            for (const hasLink of hasLinks) {
                const linkHref = hasLink.getAttribute('href');
                const linkText = removeHtmlTags(hasLink.innerHTML).trim();
                data.links.push({
                    text: linkText,
                    href: linkHref,
                });
                
            }
            const phrases = ['veranstaltet von', 'angeleitet von', 'gestaltet von', 'geleitet von'];
            for(const phrase of phrases) {
                const regexNames = new RegExp(`${phrase.replace(/\s/g, '\\s')}\\s(.*)$`, 'i');
                // const regexNames = /(gestaltet|angeleitet)\svon\s(.*)$/;
                if(text.match(regexNames)){
                    const m = text.match(regexNames);
                    if(m && m.length > 1) {
                        const n = m[1].match(/und/)
                        if(n && n.length > 0) {
                            const names = m[1].split('und').map(name => name.trim());
                            for(const name of names) {
                                if(name && name !== '') {
                                    // data.speakers.push(name.replace(/[\.|!]*$/, '').trim());
                                }
                            }
                        } else {
                            if(m[1] && m[1] !== '') {
                                // data.speakers.push(m[1].replace(/[\.|!]*$/, '').trim());
                            }
                        }
                    }
                }
            }

            if (text && text !== '' && !stop) {
                data.description.push(text);
            }
        }
    }
    return data;
}
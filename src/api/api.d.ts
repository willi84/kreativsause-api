import type { WORKSHOP_ITEM } from './workshop/workshop.d';
export type ALL_DATA = {
    generated: string;
    workshops: {
        [key: string]: WORKSHOP_ITEM;
    };
};
export type PARAGRAF = HTMLParagraphElement;

export type WORKSHOP = { href: string; title: string; id: string };

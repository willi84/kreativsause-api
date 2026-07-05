export type ID_MAP = {
    [key: string]: ID_LIST;
};
export type WORKSHOP_BASE = {
    id: string;
    title: string;
};

export type MAP = {
    [key: string]: number;
};
export type WORKSHOP_ITEM = {
    id: string;
    title: string;
    description?: string[];
    start?: string;
    end?: string;
    year: string;
    slug?: string;
    kosten?: string;
    category: string[];
    tags?: string[];
    register?: string;
    organizer?: string;
    venue?: string[];
    sections: string[];
    warnings: string[];
    speakers: string[];
    speaker_image?: string;
    days?: string[];
    year?: string;
    images?: string[];
    links?: LINK[];
};

type WORKSHOP = { href: string; title: string; id: string };

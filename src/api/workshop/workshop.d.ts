export type ID_MAP = {
    [key: string]: ID_LIST;
}
export type WORKSHOP_BASE = {
    id: string;
    title: string;
}
export type WORKSHOP_ITEM = {
    id: string;
    title: string;
    description?: string[];
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
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
    days?: string[];
    year?: string;
    images?: string[];
    links?: LINK[];
}
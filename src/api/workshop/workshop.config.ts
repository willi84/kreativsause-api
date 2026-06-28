import type { ID_MAP } from './workshop.d';


export const IDS: ID_MAP = {
    date: ['date'],
    time: ['time'],
    start: ['start'],
    end: ['end'],
    category: ['event_category'],
    tags: ['event_tags'],
    register: ['click_to_register'],
    organizer: ['organizer'],
};

export const getDays = (): string[] => {
    return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat("de-DE", { weekday: "long" })
        .format(new Date(2024, 0, 1 + i))
        .toLowerCase(),
    );
}
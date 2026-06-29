import { LOG } from '../../_shared/log/log';
import { getYearFromCategory } from '../../_shared/parse/parse';
import type { WORKSHOP_ITEM } from '../workshop/workshop.d';

export const checkCatAgainstDays = (categories: string[], days: string[]) => {
    const warnings: string[] = [];
    let isValid = true;
    for (const day of days) {
        let hasDay = false;
        for (const cat of categories) {
            if (cat.toLowerCase().indexOf(day.toLowerCase()) !== -1) {
                hasDay = true;
                break;
            }
        }
        if (!hasDay) {
            isValid = false;
            warnings.push(`Day ${day} is not included in category`);
            // LOG.WARN(`Day ${day} is not included in category`);
        }
    }
    return { isValid, warnings };
};

export const lintData = (data: WORKSHOP_ITEM) => {
    const ctx = `[${data.id}]`;
    if (data.days?.length === 0) {
        data.warnings.push(`${ctx} No days found`);
    }
    const catCheck = checkCatAgainstDays(data.category, data.days || []);
    if (!catCheck.isValid) {
        data.warnings.push(`${ctx} ${catCheck.warnings.join(', ')}`);
    }
    if (data.year === '') {
        data.warnings.push(`${ctx} No year found`);
    }
    if (data.sections?.length === 0) {
        data.warnings.push(`${ctx} No sections found`);
    }
    if (data.speakers?.length === 0) {
        data.warnings.push(`${ctx} No speakers found`);
    }
    if (data.category?.length === 0) {
        data.warnings.push(`${ctx} No categories found`);
    }
    const catYear = getYearFromCategory(data.category);
    if (data.year !== catYear) {
        data.warnings.push(
            `${ctx} Year ${data.year} does not match category year ${catYear}`
        );
    }

    if (data.warnings.length > 0) {
        LOG.DEBUG(`${ctx} ${data.warnings.length} warnings found`);
        for (const warning of data.warnings) {
            LOG.WARN(`${ctx} ${warning}`);
        }
    } else {
        // LOG.OK(`${ctx} No warnings found`);
    }

    // check days
};

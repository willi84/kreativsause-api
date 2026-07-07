import { FS } from '../_shared/fs/fs';
import { LOG } from '../_shared/log/log';

export const PHRASES = [
    'veranstaltet von',
    'angeleitet von',
    'gestaltet von',
    'geleitet von',
];

// Read file IS_DEV
export const IS_DEV = FS.hasFile('IS_DEV') ? true : false;

export const START = IS_DEV ? 15 : 0;
export const MAX = 20; // -1

if (IS_DEV) {
    LOG.WARN(
        `IS_DEV is set, only a few workshops will be processed [${START} - ${MAX}]`
    );
} else {
    LOG.OK('IS_DEV is not set, all workshops will be processed');
}

export const SHEET_ID = '1GahjRBvg9WIULJSlgj0m9rsgUf0lqXDLlTAX6fy5mA0';
export const SHEET_TAB = 'WORKSHOPS';

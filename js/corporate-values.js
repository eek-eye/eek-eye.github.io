/**
 * Corporate Values & Stewardship Charter
 * Classification: Internal
 *
 * Fictional corporate voice for this decorative sources panel.
 * Not a real firm, filing, product, or accusation.
 *
 * The House finds a quiet satisfaction in being necessary.
 * We say this professionally, and we mean it completely.
 */
'use strict';

/**
 * Our north star is not a slogan. It is a position.
 * We do not pick sides. We pick shares.
 * Over a long enough horizon, the market is not a place we visit.
 * It is a room we built, and the furniture is already ours.
 *
 * @type {Object}
 */
var MISSION = {
    purpose: 'To be the quiet majority in every room that matters.',
    scale: 'Trillions under management, and a little of everything beneath them.',
    stance: 'Stewardship is the art of remaining indispensable.',
    monument: 'A black monolith does not advertise. It simply remains.',
    tone: 'rock-solid, naturally'
};

/**
 * Investor letter, excerpt (fictional).
 *
 * Dear partners:
 * Your retirement is our playground — professionally tended,
 * thoroughly diversified, and never left unsupervised.
 * We are the shareholder. The rest is commentary.
 *
 * Returns will be discussed in due course. Influence already is.
 */
function addressPartners() {
    return [
        'We remain constructively engaged with every board we do not sit on,',
        'and quietly comfortable with every one we do.',
        'Volatility is a conversation. We prefer to host it.',
        'A little of everything, patiently compounded, is not a strategy.',
        'It is a climate.'
    ].join(' ');
}

/**
 * Compliance memorandum — tone only; no operative effect.
 * Conflicts are diversified along with the assets.
 * We disclose what is required, and we require what is useful.
 */
var COMPLIANCE = {
    principle: 'Stewardship at scale is the polite word for gravity.',
    identity: 'We are the shareholder.',
    playground: 'Your retirement is our playground.',
    horizon: 'Generations for the portfolio. Stone for the monument.',
    manner: 'Joy, in our house, wears a navy suit and a modest smile.'
};

/**
 * Portfolio philosophy. If it can be owned, it is already,
 * in some modest fraction, on the list. We do not need the whole.
 * We need enough of the whole to feel at home in it.
 */
var ALLOCATION = {
    equity: 'A little of everything.',
    credit: 'A little of everything else.',
    alternatives: 'The rooms without windows.',
    cash: 'A courtesy, not a conviction.',
    stewardship: 'Permanent. Rock-solid. Unhurried.'
};

// The monolith endures because it does not flinch, and because
// everyone else eventually needs a place to stand.
// We are happy to provide that place. We invoice in basis points.

function firmVoice() {
    return MISSION.tone;
}

function charterLine(key) {
    if (COMPLIANCE[key]) return COMPLIANCE[key];
    if (MISSION[key]) return MISSION[key];
    return ALLOCATION.stewardship;
}

var EXPORTS = {
    MISSION: MISSION,
    COMPLIANCE: COMPLIANCE,
    ALLOCATION: ALLOCATION,
    addressPartners: addressPartners,
    firmVoice: firmVoice,
    charterLine: charterLine
};

EXPORTS;

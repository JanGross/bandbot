const QUALITY = {
    BAD : 1,
    OK : 2,
    GOOD : 3,
    GREAT : 4,
    EXCELLENT : 5,
    SHINY : 6
}

const QUALITY_NAMES = {
    1 : "Bad",
    2 : "Ok",
    3 : "Good",
    4 : "Great",
    5 : "Excellent",
    6 : "Shiny"
}

const QUALITY_SYMBOLS = {
    1 : "<a:shyyOrcaTrain:1005123718542020729><:shyyDead:859552234697916426><:shyyDead:859552234697916426><:shyyDead:859552234697916426><:shyyDead:859552234697916426>",
    2 : "<a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><:shyyDead:859552234697916426><:shyyDead:859552234697916426><:shyyDead:859552234697916426>",
    3 : "<a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><:shyyDead:859552234697916426><:shyyDead:859552234697916426>",
    4 : "<a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><:shyyDead:859552234697916426>",
    5 : "<a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729><a:shyyOrcaTrain:1005123718542020729>",
    6 : "⭐⭐⭐⭐⭐"
}

const CURRENCY_SYMBOLS = {
    1 : "🎶",
    2 : "💎"
}

const CURRENCY_NAMES = {
    1 : "Notes",
    2 : "Gems"
}

const QUALITY_VALUES = {
    1 : {
        type: 1,
        value: 2
    },
    2 : {
        type: 1,
        value: 5
    },
    3 : {
        type: 1,
        value: 10
    },
    4 : {
        type: 1,
        value: 15
    },
    5 : {
        type: 1,
        value: 20
    },
    6 : {
        type: 2,
        value: 2
    }
}

exports.QUALITY = QUALITY;
exports.QUALITY_NAMES = QUALITY_NAMES;
exports.CURRENCY_SYMBOLS = CURRENCY_SYMBOLS;
exports.QUALITY_SYMBOLS = QUALITY_SYMBOLS;
exports.CURRENCY_NAMES = CURRENCY_NAMES;
exports.QUALITY_VALUES = QUALITY_VALUES;
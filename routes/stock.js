var express = require('express');
var yahooFinance = require('yahoo-finance');

var technicalindicators = require('technicalindicators');
var AbandonedBaby = technicalindicators.abandonedbaby;
var bearishengulfingpattern = technicalindicators.bearishengulfingpattern;
var threewhitesoldiers = technicalindicators.threewhitesoldiers;
var threeblackcrows = technicalindicators.threeblackcrows;
var morningstar = technicalindicators.morningstar;
var morningdojistar = technicalindicators.morningdojistar;
var eveningstar = technicalindicators.eveningstar;
var eveningdojistar = technicalindicators.eveningdojistar;
var bullishengulfingpattern = technicalindicators.bullishengulfingpattern;
var bearishengulfingpattern = technicalindicators.bearishengulfingpattern;


var router = express.Router();
/* GET users listing. */

router.get('', function (req, res, next) {
    res.send('stock respond with a resource');
});

router.post('/pattern', function (req, res, next) {
    var symbol = req.body.symbol;
    var _startDate = req.body.startDate;
    var _endDate = req.body.endDate;

    if (symbol == undefined) {
        res.send("invalid symbol");
    }
    symbol = pad(symbol, 4) + ".HK";
    let now = new Date();
    let starDate = undefined;
    let endDate = undefined;
    if (_startDate == undefined || _startDate == null) {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    if (_endDate == undefined || _endDate == null) {
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    console.log(startDate);
    console.log(endDate);

    stock_history(symbol, startDate, endDate).then((data) => {
        let pattern = check_pattern(data);
        res.send(pattern);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
});

router.get('/quote/:symbol', function (req, res, next) {
    var symbol = req.params.symbol;
    if (symbol == null || symbol == undefined) {
        res.send("invalid symbol");
    }
    symbol = pad(symbol, 4) + ".HK";
    console.log(symbol);
    stock_quote(symbol).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    });
});

router.post('/history', function (req, res) {
    var symbol = req.body.symbol;
    var _startDate = req.body.startDate;
    var _endDate = req.body.endDate;

    if (symbol == undefined) {
        res.send("invalid symbol");
    }
    symbol = pad(symbol, 4) + ".HK";
    let now = new Date();
    let starDate = undefined;
    let endDate = undefined;
    if (_startDate == undefined || _startDate == null) {
        startDate = new Date(2017, 1, 1);
    }
    if (_endDate == undefined || _endDate == null) {
        endDate = new Date();
    }

    stock_history(symbol, startDate, endDate).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    })
});

function stock_history(symbol, startDate, endDate) {
    var quote = function () {
        return new Promise(function (resolve, reject) {
            yahooFinance.historical({
                symbol: symbol,
                from: convertDate(startDate),
                to: convertDate(endDate),
                // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
            }, function (err, quotes) {
                if (err) {
                    reject(err);
                }
                resolve(quotes);
            });
        })
    }
    var result = quote();
    return result;
}

function stock_quote(symbol) {
    var quote = function () {
        return new Promise(function (resolve, reject) {
            yahooFinance.quote({
                symbol: symbol,
                modules: ['price', 'summaryDetail', 'earnings', 'financialData', 'defaultKeyStatistics'] // see the docs for the full list
            }, function (err, quotes) {
                if (err) {
                    reject(err);
                }
                resolve(quotes);
            });
        })
    }
    var result = quote();
    return result;
}

function convertDate(date) {
    try {
        return date.toISOString().substring(0, 10);
    } catch (error) {
        throw ("invalid date format")
    }
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
module.exports = router;

function check_pattern(data) {
    let data_3 = data.slice(0, 3);
    let open_3 = data_3.map(x => x.open);
    let high_3 = data_3.map(x => x.high);
    let close_3 = data_3.map(x => x.close);
    let low_3 = data_3.map(x => x.low);

    let result_3 = check_3days_pattern(open_3, close_3, high_3, low_3);

    let data_2 = data.slice(0, 2);
    let open_2 = data_2.map(x => x.open);
    let high_2 = data_2.map(x => x.high);
    let close_2 = data_2.map(x => x.close);
    let low_2 = data_2.map(x => x.low);

    let result_2 = check_2days_pattern(open_2, close_2, high_2, low_2);

    return result_2.concat(result_3);
}

function check_2days_pattern(open, close, high, low) {
    var input = {
        open: open,
        close: close,
        high: high,
        low: low
    }
    let return_result = [];
    var check_bearishengulfingpattern_result = check_bearishengulfingpattern(input);
    var check_bullishengulfingpattern_result = check_bullishengulfingpattern(input);
    if (check_bearishengulfingpattern_result.result) {
        return_result.push(check_bearishengulfingpattern_result);
    }
    if (check_bullishengulfingpattern_result.result) {
        return_result.push(check_bullishengulfingpattern_result);
    }
    return return_result;
}

function check_bearishengulfingpattern(input) {
    var result = bearishengulfingpattern(input);
    console.log('Is bullishengulfingpattern? :' + result);
    return {
        pattern: 'bearishengulfingpattern',
        result: result,
        rank: 1,
    };
}

function check_bullishengulfingpattern(input) {
    var result = bullishengulfingpattern(input);
    console.log('Is bullishengulfingpattern? :' + result);
    return {
        pattern: 'bullishengulfingpattern',
        result: result,
        rank: 5,
    };
}

function check_3days_pattern(open, close, high, low) {
    var input = {
        open: open,
        close: close,
        high: high,
        low: low
    }
    console.log(input);
    let return_result = [];
    var check_threewhitesoldiers_result = check_threewhitesoldiers(input);
    // var check_AbandonedBaby_result = check_AbandonedBaby(input);
    var check_threeblackcrows_result = check_threeblackcrows(input);
    var check_morningstar_result = check_morningstar(input);
    var check_morningdojistar_result = check_morningdojistar(input);
    var check_eveningstar_result = check_eveningstar(input);
    var check_eveningdojistar_result = check_eveningdojistar(input);

    if (check_threewhitesoldiers_result.result) {
        return_result.push(check_threewhitesoldiers_result);
    }
    // if (check_AbandonedBaby_result.result) {
    //     return_result.push(check_AbandonedBaby_result);
    // }
    if (check_threeblackcrows_result.result) {
        return_result.push(check_threeblackcrows_result);
    }
    if (check_morningstar_result.result) {
        return_result.push(check_morningstar_result);
    }
    if (check_morningdojistar_result.result) {
        return_result.push(check_morningdojistar_result);
    }
    if (check_eveningstar_result.result) {
        return_result.push(check_eveningstar_result);
    }
    if (check_eveningdojistar_result.result) {
        return_result.push(check_eveningdojistar_result);
    }
    return return_result;
}

function check_threewhitesoldiers(input) {
    var result = threewhitesoldiers(input);
    console.log('Is Three White Soldiers Pattern? :' + result);
    return {
        pattern: 'threewhitesoldiers',
        result: result,
        rank: 5,
    };
}

function check_threeblackcrows(input) {
    let result = threeblackcrows(input);
    console.log('Is Three Black Crows Pattern? :' + result);
    return {
        pattern: 'threeblackcrows',
        result: result,
        rank: 1,
    };
}

function check_morningstar(input) {
    var result = morningstar(input);
    console.log('Is morningstar? :' + result);
    return {
        pattern: 'morningstar',
        result: result,
        rank: 5,
    };
}

function check_morningdojistar(input) {
    var result = morningdojistar(input)
    console.log('Is morningdojistar? :' + result);
    return {
        pattern: 'morningdojistar',
        result: result,
        rank: 5,
    };
}

function check_eveningstar(input) {
    var result = eveningstar(input)
    console.log('Is eveningstar? :' + result);
    return {
        pattern: 'eveningstar',
        result: result,
        rank: 1,
    };
}

function check_eveningdojistar(input) {
    var result = eveningdojistar(input)
    console.log('Is eveningdojistar? :' + result);
    return {
        pattern: 'eveningdojistar',
        result: result,
        rank: 1,
    };
}
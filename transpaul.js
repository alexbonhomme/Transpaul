$(function() {
    var params = {
        time: moment().format('1%7CH%7Cmm'),
        date: moment().format('YYYY%7CMM%7CDD')
    };

    var API_BASE = 'https://www.kimonolabs.com/api/4c0vvu5c';
    var API_KEY = 'XVR3AHVfhnrC71491JshKyvRTfs0W4VB';

    $.get(API_BASE + '?apikey=' + API_KEY + '&Time=' + params.time + '&Date=' + params.date, function(data) {
        // console.log(data);
        $('#data').html('<pre>' + JSON.stringify(data.results.collection1, null, 4) + '</pre>');
    });
});
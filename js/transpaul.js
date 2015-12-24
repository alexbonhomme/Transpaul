(function () {
    'use strict';

    moment.locale('fr');

    var transpoleInstance = transpole();

    /**
     * Mustache formatter to apply specific class according to `remaining` value.
     * @return {Function} [description]
     */
    function remainingFormatter() {
        return function (text, render) {
            var remaining = parseInt(render(text), 10),
                remainingClass = 'transpole-remaining',
                remainingHuman;

            if (remaining <= 5) {
                remainingClass += ' transpaul-danger';
            } else if (remaining <= 10) {
                remainingClass += ' transpaul-warning';
            }

            remainingHuman = '<span class="transpole-remaining-number">' + remaining + '</span> ' + (remaining > 1 ? 'minutes' : 'minute');

            return '<span class="' + remainingClass + '">' + remainingHuman + '</span>';
        };
    }

    /**
     * Formats Transpole data for Mustache template.
     * @param  {Object} data [description]
     * @return {Object}      [description]
     */
    function formatTranspoleData(data) {
        var nexts = data.directions[0].nexts || [],
            nowMoment = moment(data.refDate);

        // Formats `next` value into HH:mm
        // Computes `remaining` value in minutes
        nexts = nexts.map(function (next) {
            var nextMoment = moment(next.next);

            return {
                next: nextMoment.format('HH:mm'),
                remaining: nextMoment.subtract(nowMoment).format('m')
            };
        });

        return {
            lineName: data.lineName,
            lineMode: data.lineMode.toLowerCase(),
            stopName: data.stopName,
            direction: data.directions[0].stopName,
            nexts: nexts,
            remainingFormatter: remainingFormatter
        };
    }

    /**
     * Updates DOM with Transpole data using Mustache template.
     * @param  {Object} data [description]
     */
    function handleTranspoleSuccess(data) {
        var element = document.getElementById('transpole-data'),
            template = document.getElementById('transpole.mst').innerHTML;

        if (!data.directions[0].nexts) {
            // END OF SERVICE
            element.innerHTML = '<div class="transpole-no-bus"><img src="assets/dawson-crying.jpg"><p>Tous les bus sont partis :\'-(</p></div>';

            return;
        }

        element.innerHTML = Mustache.render(template, formatTranspoleData(data));
    }

    /**
     * Updates DOM with V'Lille data using Mustache template.
     * @param  {Object} data [description]
     */
    function handlerVlilleSuccess(data) {
        var element = document.getElementById('vlille-data'),
            template = document.getElementById('vlille.mst').innerHTML,
            promises = [],
            i,
            len;

        // get stations details
        for (i = 0, len = data.length; i < len; i += 1) {
            promises.push(vlille.station(data[i].id));
        }

        D.all(promises).then(function (stations) {
            // merge both data (eg. distances)
            for (i = 0, len = stations.length; i < len; i += 1) {
                stations[i].distance = Math.round(data[i].distance);
            }

            // update DOM
            element.innerHTML = Mustache.render(template, {
                stations: stations
            });
        }, handleError);
    }

    /**
     * @param  {Object} error [description]
     */
    function handleError(error) {
        console.error(error);
    }

    /**
     * APIs calls
     */

    // requeste the 3 closest stations according to the current position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            vlille.closestStations({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }, 3).then(handlerVlilleSuccess, handleError);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    // Bus line 18 stop République
    transpoleInstance.getNext('18', '773', 'R').then(handleTranspoleSuccess, handleError);
}());
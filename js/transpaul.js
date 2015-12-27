(function () {
    'use strict';

    moment.locale('fr');

    var transpoleInstance = new Transpole({
            apiProxyUrl: 'http://localhost:8000/'
        }),
        vlilleInstance = new Vlille({
            apiProxyUrl: 'http://localhost:8001/'
        });

    /**
     * Extends an object from an other.
     * @param  {Object} objDest [description]
     * @param  {Object} objSrc  [description]
     * @return {Object}         [description]
     */
    function extend(objDest, objSrc) {
        var i,
            len,
            prop;

        for (prop in objSrc) {
            if (objSrc.hasOwnProperty(prop)) {
                objDest[prop] = objSrc[prop];
            }
        }

        return objDest;
    }


    /**
     * Transpole
     */

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
     * V'Lille
     */

    /**
     * Mustache formatter to apply specific class according to `bikes` value.
     * @return {Function} [description]
     */
    function bikesFormatter() {
        return function (text, render) {
            var value = parseInt(render(text), 10);

            if (value <= 5) {
                return '<img src="assets/bicycle-danger.svg" class="pure-img vlille-icon"><span class="vlille-quantity transpaul-strong transpaul-danger">' + value + '</span>';
            } else if (value <= 10) {
                return '<img src="assets/bicycle-warning.svg" class="pure-img vlille-icon"><span class="vlille-quantity transpaul-strong transpaul-warning">' + value + '</span>';
            }

            return '<img src="assets/bicycle.svg" class="pure-img vlille-icon"><span class="vlille-quantity">' + value + '</span>';
        };
    }

    /**
     * Mustache formatter to apply specific class according to `attachs` value.
     * @return {Function} [description]
     */
    function attachsFormatter() {
        return function (text, render) {
            var value = parseInt(render(text), 10);

            if (value <= 5) {
                return '<img src="assets/parking_bicycle-danger.svg" class="pure-img vlille-icon"><span class="vlille-quantity transpaul-strong transpaul-danger">' + value + '</span>';
            } else if (value <= 10) {
                return '<img src="assets/parking_bicycle-warning.svg" class="pure-img vlille-icon"><span class="vlille-quantity transpaul-strong transpaul-warning">' + value + '</span>';
            }

            return '<img src="assets/parking_bicycle.svg" class="pure-img vlille-icon"><span class="vlille-quantity">' + value + '</span>';
        };
    }

    /**
     * Formats V'Lille data for Mustache template.
     * @param  {Object} data [description]
     * @return {Object}      [description]
     */
    function formatVlilleData(data) {
        var stations = data.map(function (station) {
            station.distance = Math.round(station.distance);

            return station;
        });

        return {
            stations: stations,
            bikesFormatter: bikesFormatter,
            attachsFormatter: attachsFormatter
        };
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
            promises.push(vlilleInstance.station(data[i].id));
        }

        D.all(promises).then(function (stations) {
            for (i = 0, len = stations.length; i < len; i += 1) {
                // merge new data
                extend(stations[i], data[i]);
            }

            // update DOM
            element.innerHTML = Mustache.render(template, formatVlilleData(stations));
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
            vlilleInstance.closestStations({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }, 3).then(handlerVlilleSuccess, handleError);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    // Bus line 18 stop République
    transpoleInstance.next('transpole:Line:18', 'transpole:StopArea:773', 'R').then(handleTranspoleSuccess, handleError);
}());
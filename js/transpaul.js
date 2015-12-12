/*jslint browser:true*/
/*global transpole, Mustache, moment*/

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
                remainingClass = 'transpaul-remaining',
                remainingHuman;

            if (remaining <= 5) {
                remainingClass += ' transpaul-danger';
            } else if (remaining <= 10) {
                remainingClass += ' transpaul-warning';
            }

            remainingHuman = '<span class="transpaul-remaining-number">' + remaining + '</span> ' + (remaining > 1 ? 'minutes' : 'minute');

            return '<span class="' + remainingClass + '">' + remainingHuman + '</span>';
        };
    }

    /**
     * Formats Transpole data for Mustache template.
     * @param  {Object} data [description]
     * @return {Object}      [description]
     */
    function formatData(data) {
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
    function handleSuccess(data) {
        var element = document.getElementById('transpaul'),
            template = document.getElementById('template.mst').innerHTML;

        if (!data.directions[0].nexts) {
            // END OF SERVICE
            element.innerHTML = '<div class="transpaul-no-bus"><img src="assets/dawson-crying.jpg"><p>Tous les bus sont partis :\'-(</p></div>';

            return;
        }

        element.innerHTML = Mustache.render(template, formatData(data));
    }

    /**
     * @param  {Object} error [description]
     */
    function handleError(error) {
        console.error(error);
    }

    // API call
    transpoleInstance.getNext('18', '773', 'R').then(handleSuccess, handleError);

    vlille.stations().then(function (data) {
        console.log(data);
    }, function (error) {
        console.error(error);
    });
}());
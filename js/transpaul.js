/*jslint browser:true*/
/*global transpole, Mustache, moment*/

(function () {
    'use strict';

    var transpoleInstance = transpole();

    function formatData(data) {
        var nexts;

        nexts = data.directions[0].nexts.map(function (next) {
            var nextMoment = moment(next.next);
            return {
                next: nextMoment.format('HH:mm'),
                remaining: nextMoment.subtract(moment()).format('m')
            };
        });

        // MOCK
        nexts = [
            {
                next: '22:40',
                remaining: '5'
            },
            {
                next: '22:55',
                remaining: '15'
            }
        ];

        return {
            lineName: data.lineName,
            lineMode: data.lineMode.toLowerCase(),
            stopName: data.stopName,
            direction: data.directions[0].stopName,
            nexts: nexts
        };
    }

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

    function handleError(error) {
        console.error(error);
    }

    transpoleInstance.getNext('18', '773', 'A').then(handleSuccess, handleError);
}());
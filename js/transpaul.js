/*jslint browser:true*/
/*global transpole, Mustache*/

(function () {
    'use strict';

    var transpoleInstance = transpole();

    function formatData(data) {
        var nexts;

        nexts = data.directions[0].nexts.map(function (next) {
            // todo
            return next;
        });

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

        element.innerHTML = Mustache.render(template, formatData(data));
    }

    function handleError(error) {
        console.error(error);
    }

    transpoleInstance.getNext('18', '773', 'A').then(handleSuccess, handleError);
}());
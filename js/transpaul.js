/*jslint browser:true*/
/*global transpole, mustache*/

(function () {
    'use strict';

    var transpoleInstance = transpole(),
        element = document.getElementById('data');

    transpoleInstance.getNext('18', '773', 'A').then(function (data) {
        element.innerHTML = data;
    }, function (error) {
        console.error(error);
    });
}());
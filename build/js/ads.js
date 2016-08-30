"use strict";

var adsController = function () {
    var lastAdId = null;

    function generateAdId() {
        return Math.floor(Math.random() * 10000);
    }

    var getAd = function getAd() {

        var newAd = generateAdId();

        while (lastAdId === newAd) {
            newAd = generateAdId();
        }

        lastAdId = newAd;

        return newAd;
    };

    return {
        getAd: getAd
    };
}();
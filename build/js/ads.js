"use strict";

var lastAdId = null;

function generateAdId() {
    return Math.floor(Math.random() * 10000);
}

function getAd() {

    var newAd = generateAdId();

    while (lastAdId === newAd) {
        newAd = generateAdId();
    }

    lastAdId = newAd;

    return newAd;
}
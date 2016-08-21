ads = [];

getAd = function getAd() {

    function hasAd(num) {
        return window.ads.indexOf(num) != -1;
    }

    let newAd = Math.floor(ads.length * 0.0005) + Math.floor(Math.random() * 10000);
    while (hasAd(newAd)) {
    console.log(`Duplicate ad ${newAd}`);
        newAd = Math.floor(ads.length * 0.0005) + Math.floor(Math.random() * 10000);
    }
        window.ads.push(newAd);
    return newAd;
}

var adsController = function() {
    let lastAdId = null;

    function generateAdId(){
        return Math.floor(Math.random() * 10000);
    }

    var getAd = function getAd() {

        let newAd = generateAdId();

        while (lastAdId === newAd) {
            newAd = generateAdId();
        }

        lastAdId = newAd;

        return newAd;
    }

    return {
        getAd : getAd
    }
}();

'use strict';

var adCount = 0;
var itemsLength = 0;
var lastAd = true;
var pending = [];
var pendingAction = void 0;
var pendingQeueMax = 1000;
var products = [];
var productHeight = 200;
var productWidth = 470;
var sort = '';

function addAd(item) {
    lastAd = true;
    ++adCount;

    $('.products').append('<div class="product container" style="">\n        <img class="product__ad" src="/ad/?r=' + getAd() + '"/>\n    </div>');
    pending.unshift(item);
}

function addAdOrProduct(item) {
    var target = item;

    if (products.indexOf(item) !== -1) {
        return false;
    }

    ++itemsLength;

    if (!lastAd && (itemsLength - 1) % 20 === 0) {
        addAd(target);
    } else {
        addProduct(target);
    }

    return true;
};

function addProduct(item) {
    lastAd = false;
    var date = new Date(item.date);
    var old = Date.now() - date.getTime();

    //is older than week?
    if (old > 604800000) {
        date = pad(date.getMonth(), 2) + '/' + pad(date.getDate(), 2) + '/' + pad(date.getFullYear(), 4);
    } else {
        date = Math.floor(old / 86400000) + ' days ago';
    }

    $('.products').append('<div class="product container">\n            <div class="product__face" style="font-size: ' + item.size + 'px" >' + item.face + '</div>\n            <div class="product__size" >size: ' + item.size + 'px</div>\n            <div class="product__price">price: $' + (item.price * .01).toFixed(2) + '</div>\n            <div class="product__date">date: ' + date + '</div>\n        </div>');

    products.push(item);
}

function addRows() {
    var num = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];

    if (pending.length > 0) {
        (function () {
            var col = getCol();
            var length = itemsLength % col;
            var itemsToAdd = col * num - length;
            var oldAdCount = adCount;
            var i = 0;

            var queue = pending.slice(0, itemsToAdd);

            queue.map(function (item) {
                if (i < itemsToAdd) {
                    if (addAdOrProduct(item)) {
                        pending.shift();

                        if (++i > itemsToAdd) {
                            return;
                        }

                        if (lastAd) {
                            if (addAdOrProduct(item)) {
                                pending.shift();

                                if (++i > itemsToAdd) {
                                    return;
                                }
                            }
                        }
                    }
                }
            });
        })();
    }
};

function changeSort(newSort) {
    sort = newSort;
    load();
}

//thanks underscore.js!
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function getCol() {
    var D = document;
    return Math.ceil($('body').width() / (productWidth + 20));
};

function getDocHeight() {
    var D = document;
    return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight);
};

function load() {
    adCount = 1;
    lastAd = true;
    pending = [];
    products = [];
    pending = [];
    pendingAction = null;
    itemsLength = 0;

    $('.products').empty();
    $('.endOfTheLine').hide();
    $('.products').hide();
    $('.loading').slideDown('1000');

    var originalHeight = getDocHeight();
    var originalBody = $('body').height();
    var count = 0;
    for (var i = productHeight + 50; i + originalBody < originalHeight; i += productHeight + 50) {
        ++count;
    }

    pendRows(count + 8).then(function () {
        $('.loading').slideUp(500, function () {
            addRows(count);
            $('.products').fadeIn(1500);
            $('.endOfTheLine').show();
        });
    });
};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

function pendRows() {
    var rows = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];


    var length = getCol() * rows;

    if (length < 0) {
        return;
    } else if (pendingAction) {
        return;
    }

    var action = $.get('/api/products?limit=' + length + ('&skip=' + itemsLength) + (sort !== '' ? '&sort=' + sort : ''), function (data) {
        try {
            if (!data || data.length < 0) {
                return;
            }

            var json = '['.concat(data.replace(/\n/g, ','));
            json = json.substr(0, json.length - 1);
            json = json.concat(']');
            json = JSON.parse(json);

            $.each(json, function (key, item) {
                pending.push(item);
            });
        } catch (e) {
            console.log(e);
            console.log(data);
        }
    }, 'text');

    action.then(function () {
        pendingAction = null;
    });

    pendingAction = action;

    return action;
};
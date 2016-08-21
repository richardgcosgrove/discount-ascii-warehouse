let adCount = 0;
let itemsLength = 0;
let lastAd = true;
let pending = [];
let pendingAction;
let pendingQueue;
const pendingQeueMax = 1000;
let products = [];
const productHeight = 200;
const productWidth = 470;
let resort = false;

function addProduct(item) {
    let target = item;

    if (!resort
        && products.indexOf(item) !== -1) {
        return false;
    }

    if (pending.indexOf(item) == -1 &&
        pending.length > 0) {
        target = pending.splice(0,1);
        pending.push(item);
    }

    if (!lastAd && itemsLength % 20 === 0) {
        lastAd = true;
        ++itemsLength;
        ++adCount;

        $('.products')
        .append(
        `<div class="pproduct container" style="width:${productWidth}px; float: left; height: ${productHeight}px; border:5px solid black; margin: 2px; padding: 20px 5px">
            <img class="ad" src="/ad/?r=${getAd()}"/>
        </div>`);
        pending.push(item);
    } else {
        lastAd = false;
        ++itemsLength;
        let date = new Date(item.date);
        let old = Date.now() - date.getTime();

        //is older than week?
        if (old > 604800000) {
            date = `${pad(date.getMonth(),2)}/${pad(date.getDay(),2)}/${pad(date.getFullYear(),4)}`;
        } else {
            date = `${Math.floor(old / 86400000)} days ago`;
        }


        $('.products')
        .append(
            `<div class="product container" style="width:${productWidth}px; float: left; height: ${productHeight}px; border:5px solid black; margin: 2px; padding: 20px 5px">
                <div class="product__face" style="font-size: ${item.size}px; float: left; margin-left:20px">${item.face}</div>
                <div class="product__size" style="margin-top:100px;">size: ${item.size}px</div>
                <div class="product__price">price: $${(item.price * .01).toFixed(2)}</div>
                <div class="product__date">date: ${date}</div>
            </div>`
        );
        if (!resort) {
            products.push(item);
        } 
    }
    return true;
};

function addRows(num = 2) {
    if (pending.length > 0) {
        const col = getCol();
        const length = itemsLength % col;
        const itemsToAdd = (col * num) - length;
        const oldAdCount = adCount;
        let i = 0;
        // console.log(`col:${col}`);
        // console.log(`${itemsLength} + ${itemsToAdd} = ${itemsLength + itemsToAdd}`);

        pending.map(item => {
            if (i < itemsToAdd) {
                if (addProduct(item)) {
                    if (++i > itemsToAdd) {
                        return;
                    }

                    if (lastAd) {
                        if (addProduct(item)) {
                            if (++i > itemsToAdd) {
                                return;
                            }
                        }
                    }
                }
            }
        });

        pending = pending.slice(itemsToAdd - (1 + (adCount - oldAdCount)));
    }
};

//thanks underscore.js!
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
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
    // console.log(`${$('.products').width()} / ${(productWidth + 20)}`)
    return Math.ceil($('body').width() / (productWidth + 20));
};

function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
};

function load() {

    $('.products').empty();
    $('.products').hide();
    $('.loading').slideDown('1000');

    const originalHeight = getDocHeight();
    const originalBody = $('body').height();
    let count=0;
    for (let i=productHeight + 50; i + originalBody < originalHeight; i += productHeight + 50) {
        ++count;
    }

    pendRows(count+4).then(() => {
        $('.loading').slideUp(500);
        $('.products').fadeIn(1500);
    $('body')
    .append(
        `<div class="products__end" style="float:left;text-align:center; height: 100px; width:100%" >~ end of catalogue ~</div>`);
        addRows(count);
    });
};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

function pendRows(rows = 1) {
    let length = getCol()*rows-pending.length;
    if (length < 0) {
        return;
    } else if (pendingAction) {
        pendingQueue = pendingQueue >= pendingQeueMax ? pendingQeueMax : pendingQueue + length;
        return;
    }

    const action = $.get(`/api/products?limit=${getCol()*rows-pending.length}&skip=${itemsLength- Math.floor(products.length / 20)}`, function(data) {
        try {
            if (!data
                || data.length < 0) {
                return;
            }
            let json = '['.concat(data.replace(/\n/g,','))
            json = json.substr(0,json.length - 1);
            json = json.concat(']');
            json = JSON.parse(json);

            $.each(json, function(key,item) {
                pending.push(item);
            });
        } catch (e) {
            console.log(e);
            console.log(data);
        }
    }, 'text');

    action.then(() => {
        pendingAction = null;
    });

    pendingAction = action;

    return action;
};
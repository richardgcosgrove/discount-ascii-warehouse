let adCount = 0;
let itemsLength = 0;
let lastAd = true;
let pending = [];
let pendingAction;
const pendingQeueMax = 1000;
let products = [];
const productHeight = 200;
const productWidth = 470;
let sort = '';

function addAd(item) {
    lastAd = true;
    ++adCount;

    $('.products')
    .append(
    `<div class="product container" style="">
        <img class="product__ad" src="/ad/?r=${getAd()}"/>
    </div>`);
    pending.unshift(item);

}

function addAdOrProduct(item) {
    let target = item;

    if (products.indexOf(item) !== -1) {
        return false;
    }

    ++itemsLength;

    if (!lastAd 
        && (itemsLength - 1) % 20 === 0) {
        addAd(target);
    } else {
        addProduct(target);
    }

    return true;
};

function addProduct(item) {
    lastAd = false;
    let date = new Date(item.date);
    let old = Date.now() - date.getTime();

    //is older than week?
    if (old > 604800000) {
        date = `${pad(date.getMonth(), 2)}/${pad(date.getDate(), 2)}/${pad(date.getFullYear(), 4)}`;
    } else {
        date = `${Math.floor(old / 86400000)} days ago`;
    }


    $('.products')
    .append(
        `<div class="product container">
            <div class="product__face" style="font-size: ${item.size}px" >${item.face}</div>
            <div class="product__size" >size: ${item.size}px</div>
            <div class="product__price">price: $${(item.price * .01).toFixed(2)}</div>
            <div class="product__date">date: ${date}</div>
        </div>`
    );

    products.push(item);

}

function addRows(num = 2) {
    if (pending.length > 0) {
        const col = getCol();
        const length = itemsLength % col;
        const itemsToAdd = (col * num) - length;
        const oldAdCount = adCount;
        let i = 0;
        
        const queue = pending.slice(0, itemsToAdd);

        queue.map(item => {
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
    }
};

function changeSort(newSort) {
    sort = newSort;
    load();
}

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

    const originalHeight = getDocHeight();
    const originalBody = $('body').height();
    let count=0;
    for (let i=productHeight + 50; i + originalBody < originalHeight; i += productHeight + 50) {
        ++count;
    }

    pendRows(count+8).then(() => {
        $('.loading').slideUp(500, () => {
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

function pendRows(rows = 1) {

    let length = getCol() * rows;

    if (length < 0) {
        return;
    } else if (pendingAction) {
        return;
    }

    const action = $.get(`/api/products?limit=${length}` + 
        `&skip=${itemsLength}` +
        (sort !== '' ? `&sort=${sort}` : ''), function(data) {
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
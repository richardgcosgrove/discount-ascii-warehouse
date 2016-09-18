var productsController = function() {
    let adCount = 0;
    let itemsLength = 0;
    let lastAd = true;
    let pending = [];
    let pendingAction;
    const pendingQeueMax = 1000;
    let products = [];
    const productHeight = 250;
    const productWidth = 490;
    const weekInMilliseconds = 604800000;
    const dayInMilliseconds = 86400000;
    let sort = '';

    var addRows = function addRows(num = 2) {
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

    var load = function load() {
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
        for (let i=productHeight; i + originalBody < originalHeight; i += productHeight) {
            ++count;
        }

        pendRows(count+20).then(() => {
            $('.loading').slideUp(500, () => {
                addRows(count);
                $('.products').fadeIn(1500);
                $('.endOfTheLine').show();
                pendRows(20);
            });
        });
    };

    var pendRows = function pendRows(rows = 1) {

        let length = getCol() * rows;

        if (length < 0) {
            return;
        } else if (pendingAction) {
            return pendingAction;
        }

        const action = $.get(`/api/products?limit=${length}` + 
            `&skip=${products.length}` +
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

    function addAd(item) {
        lastAd = true;
        ++adCount;

        $('.products')
        .append(
        `<div class="product container" style="">
            <img class="product__ad" src="/ad/?r=${adsController.getAd()}"/>
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
        if (old > weekInMilliseconds) {
            date = `${pad(date.getMonth(), 2)}/${pad(date.getDate(), 2)}/${pad(date.getFullYear(), 4)}`;
        } else {
            date = `${Math.floor(old / dayInMilliseconds)} days ago`;
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

    function changeSort(newSort) {
        sort = newSort;
        load();
    }

    function getCol() {
        var D = document;
        return Math.ceil($('body').width() / (productWidth));
    };

    function getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    };

    function pad(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };

    return {
        addRows: addRows,
        changeSort: changeSort,
        load: load,
        pending: pending,
        pendingAction: pendingAction,
        pendRows: pendRows,
        products: products
    }
}();
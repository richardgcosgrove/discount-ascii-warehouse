var main = function() {
    

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

    function onScrollStopped(domElement, callback) {
        domElement.addEventListener('scroll', debounce(callback, 250));
    };

    $(document).ready(function() {
        const win = $(window);
        const doc = $(document);

        const evt = new CustomEvent('FeedData', { detail: 100 });
        const productsElement = document.getElementsByClassName('products')[0];
        productsElement.addEventListener('FeedData', debounce(() => {
                    productsController.pendRows(100);
        }, 100), false);
        
        // Each time the user scrolls
        win.scroll(function() {
            // End of the document reached?
            if ((doc.height() - win.height()) <= (win.scrollTop() + win.height())) {
                productsController.addRows();

                if (productsController.pending.length < 1000) { 
                    productsElement.dispatchEvent(evt);
                }
            }
        });

        onScrollStopped(window, () => {
            if ((doc.height() - win.height()) <= (win.scrollTop() + win.height())) {
                if (productsController.pending.length < 1000) {
                    let action =  productsController.pendingAction || productsController.pendRows(100);
                    try {
                        action.then(() => {
                        productsController.addRows();
                        })
                    } catch (e) {
                    }
                } else {
                    productsController.addRows();
                }
            }
        });
    });

    $('.sortingPreference').on('change', function() {
        productsController.changeSort(this.value);
    });

    productsController.load();
}();
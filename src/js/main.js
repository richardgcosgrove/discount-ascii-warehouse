$(document).ready(function() {
    const win = $(window);

    const evt = new CustomEvent('FeedData', { detail: 100 });
    const productsElement = document.getElementsByClassName('products')[0];
    productsElement.addEventListener('FeedData',debounce(() => {
                pendRows(100);
    }, 100), false);
    
    // Each time the user scrolls
    win.scroll(function() {
        // End of the document reached?
        if (($(document).height() - win.height()) <= (win.scrollTop() + 1200)) {
            addRows();
            if (pending.length < 1000) { 
                productsElement.dispatchEvent(evt);
            }
        }
    });
});

$('.sortingPreference').on('change', function() {
    changeSort(this.value);
});

load();
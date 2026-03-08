(function () {
    function updateClock() {
        var el = document.getElementById('clock');
        if (!el) return;

        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');

        el.textContent = hours + ':' + minutes + ':' + seconds;
    }

    function start() {
        updateClock();                 // show instantly (don’t wait 1s)
        setInterval(updateClock, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
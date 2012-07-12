(function(){

    /**
     * Gets all query string parameters as an object.
     * @return {String}
     */
    var getParamters = function() {

        var params = {};
        var query = window.location.toString().split('?')[1];
        if (query) {
            var items = query.split('&');
            params = [];
            for (var i = 0; i < items.length; i++) {
                var parts = items[i].split('=');
                params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }
        }

        return params;
    };

    // Get query string options with defaults.
    var options = {
        reporter: 'html'
    };

    var params = getParamters();
    for (var name in params) {
        if (params.hasOwnProperty(name) && params[name]) {
            options[name] = params[name];
        }
    }

    // Swap out html reporter with desired reporter.
    var run = buster.autoRun.run;
    buster.autoRun.run = function(contexts, opt, callbacks) {

        if (options.reporter !== 'html') {
            buster.reporters.html = buster.reporters[options.reporter];
        }

        run.apply(buster.autoRun, arguments);
    };

    // Track suites to make sure all are closed.
    var suiteCount = 0;
    buster.eventEmitter.on('suite:start', function(){
        suiteCount++;
    });

    // Log final message when all suites are done, so phantomjs can recieve it.
    buster.eventEmitter.on('suite:end', function(){
        suiteCount--;
        if (suiteCount === 0) {
            console.log('Browser tests complete.');
        }
    });
})();
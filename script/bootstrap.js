(function(){

    // Run options.
    var options = {
        reporter: 'dots'
    };

    // Swap out html reporter with desired reporter.
    var run = buster.autoRun.run;
    buster.autoRun.run = function(contexts, opt, callbacks) {
        buster.reporters.html = buster.reporters[options.reporter];
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
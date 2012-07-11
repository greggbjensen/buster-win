phantom.silent = false;
var url = phantom.args[0];

var page = require('webpage').create();
page.open(url, function(status) {
    if(!phantom.silent) {
        if (status !== 'success') {
            console.log('phantomjs failed to connect');
            phantom.exit(1);
        }

        page.onConsoleMessage = function (msg) {
            console.log(msg);

            // Listen for complete log message.
            if (/^Browser tests complete.$/.test(msg)) {
                phantom.exit();
            }
        };

        page.onAlert = function(msg) {
            console.log(msg);
        };

        page.onError = function (msg, trace) {
            console.log(msg, trace);
        };

        page.evaluate(function() {

            // Track suites to make sure all are closed.
            var suiteCount = 0;
            buster.eventEmitter.on('suite:start', function(){
                suiteCount++;
            });

            buster.eventEmitter.on('suite:end', function(){
                suiteCount--;
                if (suiteCount === 0) {
                    console.log('Browser tests complete.');
                }
            });
        });
    }
});
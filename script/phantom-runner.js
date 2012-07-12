phantom.silent = false;
var url = phantom.args[0];
var page = require('webpage').create();

var formatLog = function(msg) {

    // Encode newlines so only correct newlines will be decoded.
    console.log(msg.replace(/\r|\f|\n|\v/g, '\\n'))
};

page.open(url, function(status) {
    if(!phantom.silent) {
        if (status !== 'success') {
            formatLog('phantomjs failed to connect');
            phantom.exit(1);
        }

        page.onConsoleMessage = function (msg) {

            // Listen for complete log message.
            if (/^Browser tests complete.$/.test(msg)) {

                // Give log time to complete.
                setTimeout(function() {
                    phantom.exit();
                }, 1);
            }
            else {
                formatLog(msg);
            }
        };

        page.onAlert = function(msg) {
            formatLog('alert >>' + msg);
        };

        page.onError = function (msg, trace) {
            formatLog(msg + trace.toString());
        };
    }
});
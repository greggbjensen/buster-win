phantom.silent = false;
var url = phantom.args[0];

var page = require('webpage').create();
page.open(url, function(status) {
    try {
    if(!phantom.silent) {
        console.log(status);
        if (status !== 'success') {
            console.log('phantomjs failed to connect');
            phantom.exit(1);
        }

        page.onConsoleMessage = function (msg, line, id) {
            var fileName = id.split('/');
            // format the output message with filename, line number and message
            // weird gotcha: phantom only uses the first console.log argument it gets :(
            console.log(fileName[fileName.length-1]+', '+ line +': '+ msg);
        };

        page.onAlert = function(msg) {
            console.log(msg);
        };

        page.onError = function (msg, trace) {
            console.log(msg, trace);
        };

/*        buster.eventEmitter.on('suite:start', function(){
            console.log('start', arguments);
        });

        buster.eventEmitter.on('suite:end', function(){
            phantom.exit(0);
        });*/

        // console.log(buster);
    }

    } catch(err) {
        console.log(err);
        phantom.exit(0);
    }
    phantom.exit(0);
});
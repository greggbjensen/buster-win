/**
 * Wrapper to allow buster.js to run on windows until full support is available.
 */
(function(){
    "use strict";

    /** Includes. **/

    var fs = require('fs');
    var path = require('path');
    var _ = require('underscore');
    var glob = require('glob');
    var exec = require('child_process').exec;
    var http = require('http');

    /** Constants. **/

    // Port to run test server on.
    var DEFAULT_PORT = 1111;

    // File information for static files.
    var FILE_TYPE_INFO = {
        '.js' : { contentType: 'text/javascript', outputType: 'utf8' },
        '.html' : { contentType: 'text/html', outputType: 'utf8' },
        '.css' : { contentType: 'text/css', outputType: 'utf8' },
        '.png': { contentType: 'image/png', outputType: 'binary' },
        '.jpg': { contentType: 'image/jpeg', outputType: 'binary' },
        '.gif': { contentType: 'image/gif', outputType: 'binary' }
    };

    var busterWin = module.exports;

    /**
     * Gets a list of all test files using a pattern.
     * @param dir Root directory.
     * @param searchPatterns List of search patterns to find files for.
     * @return {Array} List of files.
     * @private
     */
    var _getFiles = function(dir, searchPatterns) {

        // Find all test files in searchPatterns.
        return _.chain(searchPatterns)
            .map(function(pattern){
                return glob.sync(pattern, { cwd: dir });
            })
            .flatten()
            .map(function(testFile){
                return path.join(dir, testFile);
            }).value();
    };

    /**
     * Processes all tests in the specified directory and sub-directories.
     * @param dir Full name of the directory.
     * @param config Execution config.
     * @private
     */
    var _executeNodeTests =  function(dir, config) {

        // Execute all tests.
        var testFiles = _getFiles(dir, config.tests);
        _(testFiles).each(function(testFile){
            console.log(testFile);
            require(testFile);
        });
    };

    /**
     * Executes browser tests.
     * @param dir Directory to execute tests for.
     * @param config Configuration to execute on.
     * @private
     */
    var _executeBrowserTests = function(dir, config) {

        // Default root path.
        var rootPath = path.join(dir, config.rootPath || '');

        // Get all script files in order of lib, sources, tests.
        var searchPaths = _([config.libs || [],
            config.sources || [],
            config.tests || []])
            .flatten();
        var scriptFiles = _getFiles(rootPath, searchPaths);

        // Start up server and output scaffolding.
        var port = config.port || DEFAULT_PORT;
        http.createServer(function (req, res) {

            // Server home page if root; otherwise serve files
            if (req.url === '/') {

                // Output relative script tags for all test scripts.
                var testScripts = _(scriptFiles).reduce(function(memo, file){
                    return memo + '        <script type="text/javascript" src="' +
                        path.relative(rootPath, file) + '"></script>\n';
                }, '');

                var html =
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n' +
                    '<html>\n' +
                    '   <head>\n' +
                    '       <title>Buster.js Test Runner</title>\n' +
                    '       <link rel="stylesheet" href="buster-test.css">\n' +
                    '   </head>\n' +
                    '   <body>\n' +
                    '       <div id="fixture"></div>\n' +
                    '       <script type="text/javascript" src="buster-test.js"></script>\n' +
                            testScripts +
                    '   </body>\n' +
                    '</html>';

                res.end(html);
            }
            // Standard file loading.
            else {
                var filePath = path.join(rootPath, req.url);

                // Check if this is a request for a buster file.
                if (/^\/buster-test/.test(req.url)) {

                    // Adjust path to buster resources location.
                    filePath = path.join(require.resolve('buster'), '../../resources', req.url);
                    console.log(filePath);
                }
                // Standard path.
                else {
                    filePath = path.join(rootPath, req.url);
                }

                fs.exists(filePath, function(exists){
                    if(!exists) {
                        res.writeHead(404, {"Content-Type": "text/plain"});
                        res.end("404 Not Found\n");
                    }
                    else {
                        fs.readFile(filePath, function(err, data){
                            if (err) {
                                response.writeHead(500, {"Content-Type": "text/plain"})
                                res.end(err);
                            }
                            else {
                                var ext = path.extname(filePath).toLowerCase();
                                var fileInfo = FILE_TYPE_INFO[ext];
                                if (!fileInfo) {
                                    res.writeHead(500, {"Content-Type": "text/plain"})
                                    res.end('Error: File type "' + ext + '" not supported.');
                                }
                                else {
                                    res.setHeader('Context-Type', fileInfo.contentType);
                                    res.end(data, fileInfo.outputType);
                                }
                            }
                        });
                    }
                });
            }

        }).listen(port, 'localhost');

        // Execute phantom.js to load test page.
        var phantomRunner = path.join(__dirname, '../script/phantom-runner.js');
        console.log('phantomjs "' + phantomRunner + '" http://localhost:' + port);
        exec('phantomjs "' + phantomRunner + '" http://localhost:' + port, function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (err) {
                console.log(err);
            }
        });
    };

    /**
     * Runs all tests in the specified directory recursively.
     * @param dir Directory to run tests in.
     */
    busterWin.execute = function(dir) {

        // Load buster.js config.
        var busterConfigFile = path.join(dir, 'buster.js');

        // Loop through each configuration and process tests.
        var configList = require(busterConfigFile);
        _(configList).each(function(config, name){

            console.log('\nRunning "' + name + '" in "' + config.environment + '" environment.\n');

            // Verify tests are set.
            if (!config.tests) {
                console.log('The property tests must be set in buster.js config.');
                return;
            }

            // Determine what type of tests are being run.
            if (config.environment === 'browser') {
                _executeBrowserTests(dir, config);
            }
            else if (config.environment === 'node') {
                _executeNodeTests(dir, config);
            }
            else {
                console.log('The environment "' + config.environment + '" is not valid.');
            }
        });
    };
})();
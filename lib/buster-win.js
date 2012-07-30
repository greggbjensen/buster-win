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
    var spawn = require('child_process').spawn;
    var http = require('http');
    var util = require("util");
    var url = require('url');
    var routes = require('./buster-routes');

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

        console.log('\nRunning "' + config.configName + '" in node environment.\n' +
            '----------------------------------------------------\n');

        // Verify tests were found.
        var testFiles = _getFiles(dir, config.tests);
        if (!testFiles || testFiles.length === 0) {
            console.log('Error: No test files found in test paths for "' + config.configName + '".');
        }

        // Execute all tests.
        _(testFiles).each(function(testFile){
            require(testFile);
        });
    };

    /**
     * Executes browser tests.
     * @param dir Directory to execute tests for.
     * @param config Configuration to execute on.
     * @param configName Name of the configuration.
     * @private
     */
    var _executeBrowserTests = function(dir, config) {

        // Start up server and output scaffolding.
        try
        {
            var server = _createHttpServer(dir, config);
            server.listen(config.port, 'localhost');

            // Only run tests if autoRun is not set to false.
            if (config.autoRun !== false) {
                _simulateBrowser(config, function(code){
                    server.close();
                });
            }
            // Display message to user to run tests.
            else {
                console.log('\n* Open a browser to http://localhost:' + config.port + ' to run "' + config.configName + '".');
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    /**
     * Simulates the browser running the tests.
     * @param config Test configuration.
     * @param done Function to call when done.
     * @private
     */
    var _simulateBrowser =  function(config, done){

        // Handles encoded log messages from phantomjs.
        var formatLog = function(data) {

            // Decode newlines, because phantomjs adds a newline on every console.log.
            var msg = data.toString();
            msg = msg.replace(/\r|\n/g, '');
            msg = msg.replace(/\\n/g, '\n');
            util.print(msg);
        };

        // Execute phantom.js to load test page.
        var phantomRunner = path.join(__dirname, '../script/phantom-runner.js');
        var phantom = spawn('phantomjs', [phantomRunner, 'http://localhost:' + config.port + '?reporter=dots']);

        phantom.stdout.on('data', formatLog);
        phantom.stderr.on('data', formatLog);

        // Stop http server on phantom exit.
        phantom.on('exit', function(code){
            done(code);
        });
    };

    /**
     * Creates a test HTTP server.
     * @param dir Running directory.
     * @param config Test configuration.
     * @return {*} Server.
     * @private
     */
    var _createHttpServer =  function (dir, config) {

        // Default root path.
        var rootPath = path.join(dir, config.rootPath || '');

        // Get all script files in order of lib, sources, tests.
        var searchPaths = _([config.libs || [],
            config.sources || []])
            .flatten();
        var scriptFiles = _getFiles(rootPath, searchPaths);

        // Verify tests were found.
        var testFiles = _getFiles(rootPath, config.tests);
        if (!testFiles || testFiles.length === 0) {
            throw new Error('No test files found in test paths for "' + config.configName + '".');
        }

        // Add tests into all scripts.
        scriptFiles = scriptFiles.concat(testFiles);

        routes.initializeRoutes(config, {rootPath: rootPath, searchPaths: searchPaths, scriptFiles: scriptFiles});

        // Initialize server.
        return http.createServer(function (req, res) {

            // Server home page if root; otherwise serve files
            var urlInfo = url.parse(req.url);
            //added parameters object to the request
            req['params'] = {};

            var matchedRoute = routes.matchRoute(urlInfo.pathname);
            if(matchedRoute) {
                //check for route parameters and add key/values to request
                if (!(_.isEmpty(matchedRoute.params))) {
                    routes.extractParams(urlInfo.pathname, matchedRoute, req);
                }

                //check for any query parameters and add the key/value pairs to the request params object
                //TODO: Implement query string params

                //execute the appropriate method callback
                matchedRoute.methods[req.method.toLowerCase()](req, res);
            }
            // Standard file loading.
            else {
                var filePath = path.join(rootPath, urlInfo.pathname);

                // Check if this is a request for a buster file.
                if (/^\/buster-test/.test(urlInfo.pathname)) {

                    // Adjust path to buster resources location.
                    filePath = path.join(require.resolve('buster'), '../../resources', urlInfo.pathname);
                }
                // Check if file requested is a buster-win script.
                else if (/^\/buster-win/.test(urlInfo.pathname)) {
                    filePath = path.join(__dirname, '../script', urlInfo.pathname.replace(/^\/buster-win/, ''));
                }
                // Standard path.
                else {
                    filePath = path.join(rootPath, urlInfo.pathname);
                }

                fs.exists(filePath, function(exists){
                    if(!exists) {
                        res.writeHead(404, {"Content-Type": "text/plain"});
                        res.end("404 Not Found\n" + filePath);
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
                                    res.setHeader('Content-Type', fileInfo.contentType);
                                    res.end(data, fileInfo.outputType);
                                }
                            }
                        });
                    }
                });
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

            // Move config name onto configuration for lookup.
            config.configName = name;

            // Verify tests are set.
            if (!config.tests) {
                console.log('The property tests must be set in buster.js config.');
                return;
            }

            // Determine what type of tests are being run.
            if (config.environment === 'browser') {

                // Verify port is set.
                config.port = config.port || DEFAULT_PORT

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
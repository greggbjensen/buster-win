/**
 * Wrapper to allow buster.js to run on windows until full support is available.
 */
(function(){
    "use strict";

    var fs = require('fs');
    var path = require('path');
    var _ = require('underscore');
    var glob = require('glob');

    var busterWin = module.exports;

    /**
     * Processes all tests in the specified directory and sub-directories.
     * @param dir Full name of the directory.
     * @param config Execution config.
     * @private
     */
    var _executeNodeTests =  function(dir, config) {

        // Find all test files in patterns.
        var testFiles = _.chain(config.tests)
            .map(function(testPattern){
                return glob.sync(testPattern);
            })
            .flatten()
            .map(function(testFile){
                return path.join(dir, testFile);
            });

        // Execute all tests.
        testFiles.each(function(testFile){
            console.log(testFile);
            require(testFile);
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

            console.log('Running "' + name + '" in "' + config.environment + '" environment.');

            // Verify tests are set.
            if (!config.tests) {
                console.log('The property tests must be set in buster.js config.');
                return;
            }

            // Determine what type of tests are being run.
            if (config.environment === 'browser') {

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
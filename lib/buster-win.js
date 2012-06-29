var fs = require('fs');
var path = require('path');

/**
 * Creates a new Buster harness for Windows.
 * @param options Test options.
 * @constructor
 */
var BusterWin = function(options) {

    // Defaults.
    this.settings = {
        tests: /-test\.js$/i // Pattern to search for tests to execute.
    };

    // Merge defaults with options.
    for (var name in options) {
        this.settings[name] = options[name];
    }
};

/**
 * Processes all tests in the specified directory and sub-directories.
 * @param dir Full name of the directory.
 * @param settings Execution settings.
 * @private
 */
BusterWin.prototype._processDir =  function(dir, settings) {

    var self = this;
    var folderItems = fs.readdirSync(dir);
    folderItems.forEach(function(folderItem) {

        // If it is a test, execute it; otherwise check if it is another directory to process.
        var fullPath = path.join(dir, folderItem);
        if (folderItem.match(self.settings.tests)) {
            require(fullPath);
        }
        else if (fs.statSync(fullPath).isDirectory()) {
            self._processDir(fullPath);
        }
    });
};

/**
 * Runs all tests in the specified directory recursively.
 * @param dir Directory to run tests in.
 */
BusterWin.prototype.run =  function(dir) {
    this._processDir(dir);
};

module.exports = BusterWin;
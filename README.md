buster-win
==========

Temporary Windows harness for busterjs (A browser JavaScript testing toolkit) until v1 is released with full support.

## Installation
1. Download phantomjs from http://phantomjs.org.
2. Add path to directory containing "phantomjs.exe" to PATH environment variable.
3. Use npm to install depedencies for node.

<pre>
npm install buster
npm install buster-win
</pre>

### Note
Install buster-win alongside buster. Buster-Win simply acts as a Windows test runner.

## Usage

buster-win will execute all tests in a folder, matching a specified pattern.

* Create a folder for your tests.  Example: "test".

Inside that folder create the following:


    test/
        buster.js
        index.js
        first-test.js
        second-test.js

* A file "index.js" with the code below.

```javascript
require('buster-win').execute(__dirname);
```

* A "buster.js" config file.

```javascript
var config = module.exports;

config["Node tests"] = {
    env: "node",
    tests: [
        "**/*-test.js"
    ]
};

config["Browser tests"] = {
    environment: "browser", // or "node"
    rootPath: "../",
    sources: [
        "lib/mylib.js", // Paths are relative to config file
        "lib/**/*.js"   // Glob patterns supported
    ],
    tests: [
        "test/*-test.js"
    ]
};
```

* Tests using busterjs (http://busterjs.org).

```javascript
var buster = require('buster');
buster.spec.expose();

describe("My thing", function () {
    it("has the foo and bar", function () {
        expect("foo").toEqual("bar");
    });

    it("states the obvious", function () {
        expect(true).toBe(true);
    });
});
```

* Run the following command where "test" is the name of the folder containing your tests.

```
node test
```

### Run With WebStorm

1. Go to the "Run" menu and choose "Edit configurations...".
2. Click on the "+" icon and choose "Node JS".
3. Set "Working Directory" to the location of your "test" folder.
4. Set "Path to Node App JS File" to "index.js" and click "OK".
5. Click on the play icon next to your configuration in the toolbar.

## Additional Documentation

All additional documentation can be found at http://busterjs.org.
buster-win
==========

Temporary Windows harness for busterjs (A browser JavaScript testing toolkit) until v1 is released with full support.

## Installation
    npm install buster-win

## Usage

buster-win will execute all tests in a folder, matching a specified pattern.

* Create a folder for your tests.  Example: "test".
* Inside that folder create a file "index.js" with the code below.

```javascript
    var BusterWin = require('buster-win');
    var busterWin = new BusterWin({ tests: /-test\.js$/i });
    busterWin.run(__dirname);
```

* Run the following command where "test" is the name of the folder containing your tests.

    node test

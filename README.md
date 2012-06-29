buster-win
==========

Temporary Windows harness for busterjs (A browser JavaScript testing toolkit) until v1 is released with full support.

## Installation
    npm install buster-win

## Usage

1. Create a folder for your tests.  Example: "test".
2. Inside that folder create a file "index.js" with the code below.

```javascript
    var BusterWin = require('buster-win');
    var busterWin = new BusterWin({ tests: /-test\.js$/i });
    busterWin.run(__dirname);
```

3. Run the following command where "test" is the name of the folder containing your tests.

    node test
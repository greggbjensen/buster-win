buster-win
==========

Temporary Windows harness for busterjs (A browser JavaScript testing toolkit) until v1 is released with full support.

## Installation
    npm install buster-win

### Note
Install buster-win alongside buster. Buster-Win simply acts as a Windows test runner.

## Usage

buster-win will execute all tests in a folder, matching a specified pattern.

* Create a folder for your tests.  Example: "test".
* Write tests using busterjs (http://busterjs.org/).
* Inside that folder create the following:
** A "buster.js" config file.
** A file "index.js" with the code below.

```javascript
require('../../lib/buster-win').execute(__dirname);
```

* Run the following command where "test" is the name of the folder containing your tests.

```
node test
```
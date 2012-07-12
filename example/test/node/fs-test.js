var buster = require('buster');
buster.spec.expose(); // Make some functions global

var fs = require('fs');
var path = require('path');

describe("fs", function () {

    it("can check if a file exists.", function (done) {

        fs.exists(path.join(__dirname, 'fs-test.js'), function(exists){
           done(function(){
               expect(exists).toEqual(true);
           })();
        });
    });

    it("Can check if something is a file.", function (done) {
        fs.stat(path.join(__dirname, 'fs-test.js'), function(err, stat){
            done(function(){
                expect(stat.isFile()).toEqual(true);
            })();
        });
    });
});
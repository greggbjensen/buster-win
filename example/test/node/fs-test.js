var buster = require('buster');
buster.spec.expose(); // Make some functions global

var fs = require('fs');
var path = require('path');

describe("fs", function () {

    it("can check if a file exists.", function (done) {

        fs.exists(__filename, function(exists){
           done(function(){
               expect(exists).toEqual(true);
           })();
        });
    });

    it("Can check if something is a file.", function (done) {
        fs.stat(__filename, function(err, stat){
            done(function(){
                expect(stat.isFile()).toEqual(true);
            })();
        });
    });
});
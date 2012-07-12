var buster = require('buster');
buster.spec.expose(); // Make some functions global

var util = require('util');

describe("util", function () {

    it("can test if something is an array.", function () {
        expect(util.isArray(['a', 'b', 'c'])).toBe(true);
    });

    it("formats strings.", function () {
        expect(util.format('%s: %d', 'number', 1234)).toEqual('number: 1234');
    });
});
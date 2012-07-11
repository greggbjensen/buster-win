var buster = require('buster');
buster.spec.expose(); // Make some functions global

describe("node", function () {
    it("states the obvious", function () {
        expect(true).toEqual(true);
    });
});
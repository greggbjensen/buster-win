console.log('jquery-test');

buster.spec.expose(); // Make some functions global.

describe("jquery", function () {
    it("states the obvious", function () {
        expect(true).toEqual(true);
        console.log('test 1');
    });
});
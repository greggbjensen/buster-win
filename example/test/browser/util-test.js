buster.spec.expose(); // Make some functions global.

describe("util", function () {
    it("trims a string.", function () {
        expect(util.trim('  extra space      ')).toBe('extra space');
    });

    it("tests for an array.", function () {
        expect(util.isArray([1, 3, 4])).toBe(true);
    });
});
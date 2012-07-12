buster.spec.expose(); // Make some functions global.

describe("jquery", function () {
    it("trims a string.", function () {
        expect(jQuery.trim('  extra space      ')).toBe('extra space');
    });

    it("tests for an array.", function () {
        expect(jQuery.isArray([1, 3, 4])).toBe(true);
    });
});
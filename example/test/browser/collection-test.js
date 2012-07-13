buster.spec.expose(); // Make some functions global

describe("collection", function () {

    it("gets the first item.", function () {
        expect(collection.first([4, 5, 6])).toBe(4);
    });

    it("gets the max item.", function (done) {
        done(function(){
            expect(collection.max([4, 9, 6])).toBe(9);
        })();
    });
});
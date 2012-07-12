buster.spec.expose(); // Make some functions global

describe("underscore", function () {

    it("gets the first item.", function () {
        expect(_([4, 5, 6]).first()).toBe(4);
    });

    it("gets the max item.", function (done) {
        done(function(){
            expect(_([4, 9, 6]).max()).toBe(9);
        })();
    });
});
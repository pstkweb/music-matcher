var expect = require("chai").expect,
    BMH = require("../models/BoyerMooreHorspool");

describe("Boyer-Moore-Horspool", function(){
    describe("#run()", function(){
        it("should find the sub sequence", function(){
            var seq = ["ii", "V", "VI", "I", "IV", "iii", "VII"],
                result1 = BMH.run(["VI", "ii"], seq),
                result2 = BMH.run([], seq),
                result3 = BMH.run(["V", "VI", "I"], seq);

            expect(result1).to.equal(-1);
            expect(result2).to.equal(0);
            expect(result3).to.equal(1);
        });
    });
});
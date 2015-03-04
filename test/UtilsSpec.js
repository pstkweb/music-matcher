var expect = require("chai").expect,
    Utils = require("../models/Utils.js");

describe("Utils", function(){
    describe("#indexOfPoint()", function(){
        it("should find the first instance of a point", function(){
            var result1 = Utils.indexOfPoint([{x:0, y:4}, {x:0, y:2}, {x:0, y:0}], {x:0, y:0}),
                result2 = Utils.indexOfPoint([{x:0, y:4}, {x:0, y:2}, {x:0, y:0}], {x:1, y:0}),
                result3 = Utils.indexOfPoint([{x:0, y:4}, {x:10.5607, y:0}, {x:0, y:2}, {x:0, y:0}, {x:10.5607, y:0}], {x:10.5607, y:0});

            expect(result1).to.equal(2);
            expect(result2).to.equal(-1);
            expect(result3).to.equal(1);
        });
    });

    describe("#transform()", function(){
        it("should create an array with minimum index changes", function(){
            var src = [{x:0, y:4}, {x:0, y:2}, {x:0, y:0}],
                result1 = Utils.transform(src.slice(), [{x:0, y:2}, {x:0, y:0}, {x:24, y:0}]),
                result2 = Utils.transform(src.slice(), []),
                result3 = Utils.transform(src.slice(), [{x:0, y:6}, {x:7, y:2}, {x:24, y:0}]);

            expect(result1).to.eql([{x:24, y:0}, {x:0, y:2}, {x:0, y:0}]);
            expect(result2).to.eql([]);
            expect(result3).to.eql([{x:0, y:6}, {x:7, y:2}, {x:24, y:0}]);
        });
    });
});
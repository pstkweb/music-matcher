var expect = require("chai").expect,
    Chord = require("../models/Chord");

describe("Chord", function(){
    describe("#fromProgressionDegree()", function(){
        it("should return the right chord", function(){
            var result1 = Chord.fromProgressionDegree("F#", "V"),
                result2 = Chord.fromProgressionDegree("F#", "vi"),
                result3 = Chord.fromProgressionDegree("C", "iii");

            expect(result1).to.have.a.property("tonic", "C#");
            expect(result2).to.have.a.property("tonic", "D#m");
            expect(result3).to.have.a.property("tonic", "Em");
        });
    });
});
'use strict';
define(["lib/zip"], function (zip){
    chai.should();
    describe("zip", function(){
        it("should not be null", function(){
            zip.should.not.be.null;
        })
    });
});
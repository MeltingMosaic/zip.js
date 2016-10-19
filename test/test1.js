'use strict';
define(["lib/zip", "lib/mime-types"], function (zip, mimeTypes) {
    chai.should();
    describe("zip", function () {

        var TEXT_CONTENT = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.";

        var ZIPPED_CONTENT = "data:application/zip;base64,UEsDBBQACAgIAGZzUkkAAAAAAAAAAAAAAAAJAAAAbG9yZW0udHh0XVNLbtwwDL0KDzCYC3TZdlGg7ao9AEeiPQT0i0ROmpy+j3bSAF3ZlqXH99P3PqWSjuWVci990lIjrmIXSr0tSSbmMomzDl1J205SFH+XZMrKlVpvXusLNb3dSVxX7ZlMW9LszciNCmOK2DlAqPLemLjok+O4TDZ69OI22K702+hZl5I0rRhKVePlgU+uF3oCPAYum55J/shMSsamvZGXwjX1OUB2OZgOCCn91qfFGV0lqBxTdeAsCUNhBdl+KgUbzP8SE9hNYmiBHrgz1UH7tEcb3aXlKRPw+Hh4GQ4KEtuxJGtBYS+yTOUD+HKgaSnvPgugaRPfFfJbkKeNkxZox3w4IrPDm74IxnFKXhe3eFdf1qln7bB/h64Ff6CJboVbBoMxWZbA+eIDxDDw9XVqoSwFLgLMd4ea0PnGBOSDCev/TK70EwkVvcFTODKgH0RoRVqMHG7AAKpucIT6OHKA5MBvesdMrYgj65F9je5oBlf0o/IraI/C6ch/iyeNfojhhTZe6dfL0CgX3fkWclJheM6RjDa0lOsnuI2CIW0qsmMP6CASxSMMCRUIpE9Q/jh8pW/tEensR28ELkhFTDYZnkdjC0oPW07Q6KvAAl8ncdVYjm2LZWD5Sp9P7HWwEYs7MWZPaAIO5ZfGVZOvo7wUbVDzSdXP3kJNlMRxy7KC6Dk89P/QIB6YrRuDx3Fd0DGDZbR3u2viy7navCWKHlaMHPyuOK4MNxMY60dh307H/63PCs53r9zCGZh2XB3h5KgAYCcyzpK0cvQOvNu/hSt97bCNjttjCOpUd9A4a/HQjEAg9IMNNm3K4VwvRWpYj7Q2xy7o/QtQSwcIyBWUhnUCAACKBAAAUEsBAhQAFAAICAgAZnNSScgVlIZ1AgAAigQAAAkAAAAAAAAAAAAAAAAAAAAAAGxvcmVtLnR4dFBLBQYAAAAAAQABADcAAACsAgAAAAA="

        var FILENAME = "lorem.txt";

        var blob = new Blob([TEXT_CONTENT], {
            type: mimeTypes.getMimeType(FILENAME)
        });

        var zippedBlob = null;
        it("should zip a blob", function (done) {
            zip.useWebWorkers = false;
            zip.createWriter(new zip.BlobWriter("application/zip"), function (zipWriter) {
                zipWriter.add(FILENAME, new zip.BlobReader(blob), function () {
                    zipWriter.close(function (blob) {
                        zippedBlob = blob;
                        zippedBlob.should.not.be.null;

                        var reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = function () {
                            var base64data = reader.result.toString();
                            base64data.length.should.be.equal(ZIPPED_CONTENT.length);
                        }

                        done();
                    });
                });
            });
        });

        it("should unzip a blob", function (done) {
            var blob = dataURItoBlob(ZIPPED_CONTENT);
            zip.createReader(new zip.BlobReader(blob), function (zipReader) {
                zipReader.getEntries(function (entries) {
                    entries[0].getData(new zip.BlobWriter(mimeTypes.getMimeType(entries[0].filename)), function (data) {
                        zipReader.close();
                        data.should.not.be.null;
                        
                        var reader = new FileReader();
                        reader.readAsText(data);
                        reader.onloadend = function() {
                            var text = reader.result;

                            text.should.equal(TEXT_CONTENT);
                        }

                        done();
                    });
                })
            });
        });

        function dataURItoBlob(dataURI) {
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            var blob = new Blob([ab], { type: mimeString });
            return blob;
        }
    });
});
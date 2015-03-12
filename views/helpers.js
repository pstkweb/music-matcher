(function() {
    var register = function(Handlebars) {

        /************* BEGIN HELPERS *************/
        var helpers = {
            uniqValues: function(a, opt){
                var b = a.filter(function(val, i, self){
                        return self.indexOf(val) === i;
                    }),
                    ret = "";

                for (var i in b) {
                    ret += opt.fn(b[i]);
                }

                return ret;
            },
            getSongSimilarPart: function(part, index){
               return part[index].element;
            },
            strCmp: function(a, b, opt){
                if (a == b)
                    return opt.fn(this);
                else
                    return opt.inverse(this);
            },
            progToChord: function(root, degree, opt){
                var sharp = (root.length > 1),
                    intDegree = null,
                    scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
                switch (degree) {
                    case 'I':
                        intDegree = 1;
                        break;
                    case 'II':
                    case 'ii':
                        intDegree = 2;
                        break;
                    case 'III':
                    case 'iii':
                        intDegree = 3;
                        break;
                    case 'IV':
                        intDegree = 4;
                        break;
                    case 'V':
                        intDegree = 5;
                        break;
                    case 'VI':
                    case 'vi':
                        intDegree = 6;
                        break;
                    case 'VII':
                        intDegree = 7;
                        break;
                }

                var i = (scale.indexOf(root.charAt(0)) + (intDegree - 1) * 2 - (intDegree >= 4 ? 1 : 0)),
                    note = scale[i % scale.length];

                if (sharp) {
                    // Double dièse
                    if (note.length > 1) {
                        note = scale[scale.indexOf(note) + 1];
                    } else {
                        note += "#";
                    }
                }

                if (degree.match(/[iv]+/)) {
                    note += "m";
                }

                return note;
            }
        };
        /************* END HELPERS *************/

        if (Handlebars && typeof Handlebars.registerHelper === "function") {
            // register helpers
            for (var prop in helpers) {
                Handlebars.registerHelper(prop, helpers[prop]);
            }
        } else {
            // just return helpers object if we can't register helpers here            
            return helpers;
        }
    };

    // client
    if (typeof window !== "undefined") {
        register(Handlebars);
    }
    // server
    else {
        module.exports.register = register;
        module.exports.helpers = register(null);
    }
})();
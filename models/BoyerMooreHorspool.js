function BoyerMooreHorspool(){}

/**
 * Run the Boyer-Moore-Horspool algorithm
 * @param needle The list to find
 * @param haystack The list to search in
 * @returns {number} The index of needle in haystack, -1 if it's not in
 */
BoyerMooreHorspool.run = function(needle, haystack){
    var badMatchTable = {};
    var maxOffset = haystack.length - needle.length;
    var offset = 0;
    var last = needle.length - 1;
    var scan;

    if (needle.length == 0)
        return 0;

    // Génération de la table des décalages de sauts pour
    // une comparaison infructueuse
    Array.prototype.forEach.call(needle, function (char, i) {
        badMatchTable[char] = last - i;
    });

    // Recherche de la chaine
    while (offset <= maxOffset) {
        // Recherche de droite à gauche, vérifiant que les indices courants de
        // needle et haystack correspondent. Si c'est le cas on décrémente et
        // répète l'opération, si le permier caractère de needle correpond on
        // retourne sa position.
        for (scan=last; needle[scan] === haystack[scan+offset]; scan--) {
            if (scan === 0) {
                return offset;
            }
        }

        offset += badMatchTable[haystack[offset + last]] || last;
    }

    return -1;
};

module.exports = BoyerMooreHorspool;
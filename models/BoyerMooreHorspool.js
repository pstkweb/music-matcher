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

    // Generate jump table
    Array.prototype.forEach.call(needle, function (char, i) {
        badMatchTable[char] = last - i;
    });

    // Search the string
    while (offset <= maxOffset) {
        // Right-to-left search
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
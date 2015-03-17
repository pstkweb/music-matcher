function Utils(){}

/**
 * Transform an array of points to another with the least
 * points movements
 * @param a The array to transform
 * @param b The array wanted
 * @returns {*} An array transforming b to have the least movements
 * compared to a
 */
Utils.transform  = function(a, b) {
    if (b.length == 0) {
        return [];
    }

    if (a.length == 0) {
        return b;
    }

    // Keep only changed values in b and unchanged values in a
    for (var i=0; i<a.length;i++){
        var pos = Utils.indexOfPoint(b, a[i]);
        if (pos == -1) {
            a[i] = -1;
        } else {
            b.splice(pos, 1);
        }
    }

    // Add changed values to a
    for (var j=0; j<a.length;j++) {
        if (a[j] == -1) {
            a[j] = b[0];
            b.splice(0, 1);
        }
    }

    return a;
};

/**
 * Get the index of a point in an array
 * @param array The array to search in
 * @param point The point to find
 * @returns {number} The array index of the point, -1 if it is not found
 */
Utils.indexOfPoint = function (array, point) {
    for (var i=0; i<array.length; i++) {
        if (array[i].x == point.x && array[i].y == point.y) {
            return i;
        }
    }

    return -1;
};

/**
 * Return all sub-lists of the given list
 * @param array The list to process
 * @param chunkSize The size of sub-lists
 * @returns {Array} The list of sub-lists
 */
Utils.subLists = function(array, chunkSize) {
    if (array.length < chunkSize)
        return [];

    var nbChunks = array.length - chunkSize + 1,
        chunks = [];
    for (var i=0; i<nbChunks; i++) {
        chunks.push(array.slice(i, (i + chunkSize)));
    }

    return chunks;
};

module.exports = Utils;
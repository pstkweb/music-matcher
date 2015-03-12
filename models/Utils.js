function Utils(){}

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

Utils.indexOfPoint = function (array, point) {
    for (var i=0; i<array.length; i++) {
        if (array[i].x == point.x && array[i].y == point.y) {
            return i;
        }
    }

    return -1;
};

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
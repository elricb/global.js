/**
 * The main fact to be known about this, is it assumes/works on json objects that are one dimension deep
 * e.g. [{obj:1}, {obj:2}, {obj:3}]
 */
function jsondb(db) {
    this.db = Cast.carray(db);
}

jsondb.prototype.get = function() {
    return this.db;
};

jsondb.prototype.sort = function(col, dir) {
    col = Cast.cstring(col);
    dir = Cast.cboolean(dir, true);
    
    this.db.sort(function(a,b){
        if (a[col] > b[col])
          return 1;
        if (a[col] < b[col])
          return -1;
        return 0;
    });
    
    if (! dir)
        this.db.reverse();
        
    return this.db;
};

jsondb.prototype.sfilter = function(col, reg, pos) {
    col = Cast.cstring(col);
    pos = Cast.cboolean(pos, true);
    var r = [],
        i;
    
    for (i in this.db) {
        if (Cast.cstring(this.db[i][col]).test(reg))
            if (pos)
                r.push(this.db[i]);
        else
            if (! pos)
                r.push(this.db[i]);
    }
    
    return r;
};

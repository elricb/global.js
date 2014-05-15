/**
 * General URL string parsing
 * From:  objects/URL.js
 * @class URL
 * @version 1.2
 * @requires Cast
 * @property {Float} version
 * @property {String} href full url (http://somewhere.domain.com:21/hi.html?v=3&c=2#chapter)
 * @property {String} host full domain (somewhere.domain.com)
 * @property {String} domain sans sub domain (domain.com)
 * @property {String} hash (#hash)
 * @property {String} port the port number (:81)
 * @property {String} protocol protocol (http:)
 * @property {String} query full query string sans "?" (var1=one,var2=two,var3=three)
 */
var URL = {
    version:  1.3,
    cookieMax:4E3,
    href:     Cast.cstring(window.location.href),     //http://somewhere.domain.com:21/hi.html?v=3&c=2#chapter
    host:     Cast.cstring(window.location.hostname), //somewhere.domain.com
    domain:   "",                                     //domain.com
    hash:     Cast.cstring(window.location.hash),     //#chapter
    port:     Cast.cstring(window.location.port),     //21
    protocol: Cast.cstring(window.location.protocol), //http:
    path:     "",                                     //'/folder/file.dat'
    file:     "",                                     //FF only window.location.pathname
    //v=3&c=2
    query : (Cast.cstring(window.location.search).split("?").length > 1)?Cast.cstring(window.location.search).split("?")[1]:Cast.cstring(window.location.search),
    /**
     * setValues
     * Generates the .port and .domain on load
     */
    setDefaults: function()
    {
        this.getDomain();
        this.getPath();
    },
    /**
     * to ensure we have only the domain portion of the URL
     * it's hard to tell the domain for multi level top level domain and sub domain urls e.g. en.sub.domain.to.on.ca - so we're assuming one level of subdomain
     * @return {string} domain
     */
    getDomain: function()
    {
        this.domain = Cast.cstring(this.hostname);
        var arr = this.domain.split(".");
            
        if (arr.length < 1) {
            arr = this.href.split("/");
            var i=0;
            for (;i<arr.length && arr[i].indexOf(".") == -1;i++){}
            arr = arr[i].split(".");
        }
        
        if (arr.length > 2) 
            arr.shift();
        
        return this.domain = arr.join(".");
    },
    /**
     * extracts the path
     */
    getPath: function()
    {
        var path = this.href.match(/[^:][^/][^/]\/([^\?\#]*)/);
        if (! path)
            path = "";
        else if (path.length > 1)
            path = path[1];
        return this.path = path;
    },
    /**
     * get a portion or all of the query string
     * @param  {Object} [val] - the query string key
     * @return {string} the key's value or entire query string upon omission of key
     */
    getQuery: function(val)
    {
        val = Cast.cstring(val);
        if ( ! val )
            return this.query;
            
        var temp = this.query.split("&");
        var i = 0;
        for(;i<temp.length && temp[i].substr(0,temp[i].indexOf("=")) != val;i++){}
        if(temp[i].substr(0,temp[i].indexOf("=")) != val)
            return "";
        return temp[i].substr( (temp[i].indexOf("=")+1) );
    },
    /**
     * Get an altered Query string based on existing or custom
     * @param  {json}   updates - kvp of changed query values
     * @param  {string} [query] - a query string to use instead of this.query
     * @return {string} the new query string
     */
    setQuery : function(updates, query)
    {
        updates = Cast.cjson(updates);
        query   = (Cast.isString(query))?query:this.query;
        
        var fields = query.split("&"),
            values = {};
        
        for ( var k in fields ){
            k2 = Cast.cstring(fields[k].split("=")[0]);
            if ( k2 )
                values[k2] = Cast.cstring(fields[k].split("=")[1]); 
        }
        
        for ( var k in updates ) 
           values[k] = Cast.cstring(updates[k]);
        
        if (typeof jQuery == 'function')
            return jQuery.param(values);
        
        var str = "";
        for ( var k in values )
            str += "&" + k + "=" + values[k];
        return str.replace(/^&/, '');
    },
    /**
     * application/x-www-form-urlencoded (aka POST) use + not %20
     */
    encode : function(v)
    {
        if (typeof encodeURIComponent == 'undefined') //ECMAScript 3rd Edition
            return escape(v);
        return encodeURIComponent(v); //not RFC 3986 compatible [!',*)']
    },
    decode : function(v)
    {
        if (typeof decodeURIComponent == 'undefined') //ECMAScript 3rd Edition
            return unescape(v);
        return decodeURIComponent(v); //not RFC 3986 compatible [!',*)']
    },
    /**
     * @param {string} name
     * @param {string} value
     * @param {string} [path]
     * @param {int}    [days]
     * @return {boolean} success/failure
     */
    setCookie : function(name, value, path, days)
    {
        var expires = "",
            cookie  = "",
            date    = new Date();
        path  = Cast.cstring(path, "/");
        value = this.encode(Cast.cstring(value));
        
        if (Cast.cint(days)) {
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        
        cookie = name+"="+value+expires+"; path=" + path;
        if (cookie.length > this.cookieMax) //browser can not set cookie
            return false;
        
        try {
            document.cookie = cookie;
        } catch (e) {
            return false;
        }
        
        return true;
    },
    /**
     * @param {string} name
     * @return {null|string} failure/success
     */
    getCookie : function(name) {
        try {
            var co = document.cookie;
        } catch (e) {
            var co = "";
        }
        
        var i, c,
            nameEQ = name + "=",
            ca = co.split(';');
        
        for(i=0;i < ca.length;i++) {
            c = ca[i];
            while (c.charAt(0)==' ') 
                c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) 
                return this.decode(c.substring(nameEQ.length,c.length));
        }
        
        return null;
    },
    /**
     * @return {json} saved cookies
     */
    getCookies : function() {
        try {
            var co = document.cookie;
        } catch (e) {
            var co = "";
        }
        
        var i, c, k,
            ca = co.split(';'),
            cookies = {};
        
        for(i=0;i < ca.length;i++) {
            c = ca[i].indexOf('=');
            k = ca[i].substr(0, c).trim();
            cookies[c] = this.decode(ca[i].substr(c+1));
        }
        
        return cookies;
    }
};
URL.setDefaults();
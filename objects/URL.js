/**
 * dependancies: Cast.js
 * General URL string parsing
 */
URL = {
    "version" : 1.1,
    "href"    : Cast.cstring(window.location.href),
    "host"    : Cast.cstring(window.location.hostname),
    "domain"  : "",
    "hash"    : Cast.cstring(window.location.hash),
    "port"    : Cast.cstring(window.location.port),
    "protocol": Cast.cstring(window.location.protocol),
    "query"   : (Cast.cstring(window.location.search).split("?").length > 1)?Cast.cstring(window.location.search).split("?")[1]:Cast.cstring(window.location.search),
    
    setValues: function()
    {
        return this.setDomain().setPort();
    },
    
    /**
     * to ensure we have only the domain portion of the URL
     * it's hard to tell the domain for multi level top level domain and sub domain urls e.g. en.sub.domain.to.on.ca - so we're assuming one level of subdomain
     * @return {string} domain
     */
    setDomain: function()
    {
        this.domain = Cast.cstring(window.location.hostname);
        var arr = this.domain.split(".");
            
        if (arr.length < 1) {
            arr = window.location.href.split("/");
            var i=0;
            for (;i<arr.length && arr[i].indexOf(".") == -1;i++){}
            arr = arr[i].split(".");
        }

        if (arr.length > 2) 
            arr.shift();
        
        this.domain = arr.join(".");
        return this;
    },
    
    setPort: function()
    {
        this.port = Cast.cstring(this.port);
        if ( ! this.port )
            this.port = "21";
        return this;
    },
    
    /**
     * get a portion or all of the query string
     * @param {Object} val - the query string key
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
     * @param {json} updates - kvp of changed query values
     * @param {string} [query] - a query string to use instead of this.query
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
    }
    
};
URL.setValues();
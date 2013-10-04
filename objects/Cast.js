/**
 * Safe/Defaults variable casting and type detection
 * from: objects/Cast.js
 * dependancies: javascript 1.0
 */
var Cast = {
    //version
    v:3.1,
    /**
     * convert anything to integer
     * @param {mixed} [i] - variable to convert
     * @param {mixed} [df] - default to return on cast error
     * @return {int} or default[0] on error
     */
    cint : function(i,df)
    {
        if ( typeof df == 'undefined' ) 
            df = 0;
            
        if ( typeof i == 'undefined' )
            return df;
        i = parseInt(i,10);
        if ( isNaN(i) )
            return df;
        return i;
    },
    /**
     * convert anything to float
     * @param {mixed} [i] - variable to convert
     * @param {mixed} [df] - default to return on cast error
     * @return {float} or default[0] on error
     */
    cfloat : function(i,df)
    {
        if ( typeof df == 'undefined' ) 
            df = 0;
        if ( typeof i == 'undefined' )
            return df;
        i = parseFloat(i,10);
        if ( isNaN(i) )
            return df;
        return i;
    },
    /**
     * check if is numeric
     * @param {mixed} v - value to check
     * @return {bool}
     */
    isNumber : function(v)
    {
        if (typeof v == "number")
            return true;
        if (typeof v == 'object' && v) //null evaluates as object
            if ( v.constructor == Number )
                return true;
        return false;                
    },
    /**
     * convert anything to object
     * @param {mixed} o - value to check
     * @param {mixed} [d] - default to set ({} if omitted)
     * @return {object} returns empty object or default value on error
     */
    cobject : function(o,d)
    {
        if ( typeof d == 'undefined' )
            d = {};
        if ( typeof o == 'object' && o) //null evaluates as object
            return o;
        return d;
    },
    /**
     * check if is object
     * @param {mixed} v - value to check
     * @return {bool} 
     */
    isObject : function(v)
    {
        if (typeof v == "object" && v) //null validates as object
            return true;
        return false;                
    },
    /**
     * convert anything to string
     * @param {mixed} [s] - variable to convert
     * @param {mixed} [df] - default to set ("" if omitted)
     * @return {string} or default[""] on error
     */
    cstring : function(s,df)
    {
        if ( typeof df == 'undefined' ) 
            df = "";
        if ( typeof s == 'undefined' )
            return df;
        return s + "";
    },
    /**
     * check if is string
     * @param {mixed} v - value to check
     * @return {boolean} 
     */
    isString : function(v)
    {
        if (typeof v == "string")
            return true;
        if (typeof v == 'object' && v)
            if ( v.constructor == String )
                return true;
        return false;                
    },
    /**
     * convert anything to boolean
     * @param {mixed} [b] - variable to convert
     * @param {mixed} [df] - default to set (false if omitted)
     * @return {boolean} or default[false] on error
     */
    cboolean : function(b,df)
    {
        if ( typeof df == 'undefined' )
            df = false;
        if ( typeof b == 'undefined' )
            return df;
        return !!b;
    },
    /**
     * check if is boolean
     * @param {mixed} [v] - value to check
     * @return {boolean} 
     */
    isBoolean : function(v)
    {
        if (typeof v == "boolean")
            return true;
        if (typeof v == 'object' && v)
            if ( v.constructor == Boolean )
                return true;
        return false;                
    },
    /**
     * converts to json
     * @param {mixed} [jq] - variable to convert
     * @param {mixed} [df] - default to return on cast error
     * @return {jQuery} or default[$()] on error
     */
    cjson : function(j, df)
    {
        if ( ! this.isObject(j) )
            if ( this.isString(j) )
                if ( typeof JSON != 'undefined' )
                    try { //throws error if improperly assembled json
                        j = JSON.parse(j);
                    } catch(e) {
                        j = {"error":e.message}
                    }
                else
                    try {
                        j = eval('(' + j + ')');
                    } catch(e) {
                        j = {"error":e.message}
                    }
        if ( typeof df != 'undefined' && typeof j != 'object')
            return df;
        return this.cobject(j);
    },
    /**
     * converts to json to string
     * @param {mixed} [j] - variable to convert
     * @param {mixed} [df] - default to return on cast error
     * @return {string} or default on error
     */
    csjson : function(j, df)
    {
        if ( this.isObject(j) )
            if ( typeof JSON != 'undefined' )
                try { //throws error if improperly assembled json
                    j = JSON.stringify(j);
                } catch(e) {
                    j = {"error":e.message}
                }
            else { //simple string json
                a=new Array();
                for(i in j)
                    if( obj.hasOwnProperty( prop ) )
                        if (this.isObject(i[j]))
                            a.push("\""+this.cstring(j)+"\":"+this.csjson(i[j])+"");
                        else
                            a.push("\""+this.cstring(j)+"\":\""+this.cstring(i[j])+"\"");
                return "{"+a.join()+"}";
            }
        if ( typeof df != 'undefined' )
            return df;
        return this.cstring(j);
    },
    /**
     * convert anything to jquery object
     * @param {mixed} [jq] - variable to convert
     * @param {mixed} [df] - default to return on cast error
     * @return {jQuery} or default[$()] on error
     */
    cjquery : function(jq,df)
    {
        if ( typeof df == 'undefined' ) 
            df = jQuery();
        if ( typeof jq == 'undefined' )
            return df;
        if ( ! jq )
            return df;
        return jQuery(jq);
    }, 
    /**
     * check if is jquery
     * @return {boolean} 
     */
    isJquery : function(v)
    {
        if (typeof v == 'object' && v)
            if ( v.jquery )
                return true;
        return false;                
    },
    /**
     * convert anything to date
     * @param {mixed} [v] - variable to convert
     * @param {mixed} [df] - default to return (Date() if omitted)
     * @return {Date} default[Date()] on error
     */
    cdate : function(v,df)
    {
        if ( typeof df == 'undefined' ) 
            df = Date();
        if ( typeof v == 'undefined' )
            return df;
        v = Date.parse(v);
        if ( isNaN(v) )
            return df;
        return v;
    }, 
    /**
     * check if is Date
     * @return {boolean} 
     */
    isDate : function(v)
    {
        if (typeof v == 'object' && v) //null evaluates as object
            if ( v.constructor == Date )
                return true;
        return false;                
    },
    /**
     * convert undefined to a default value
     * @param {mixed} [v] - variable to convert
     * @param {mixed} [df] - default to return 
     * @return {mixed} or default[null] on error
     */
    cdefault : function(v,df)
    {
        if ( typeof df == 'undefined' ) 
            df = null;
        if ( typeof v == 'undefined' )
            return df;
        return v;
    },
    /**
     * check if is function
     * @return {boolean} 
     */
    isFunction : function(v)
    {
        if (typeof v == "function")
            return true;
        if (typeof v == 'object' && v)
            if ( v.constructor == Function )
                return true;
        return false;                
    }
};


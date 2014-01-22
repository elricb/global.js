/**
 * Safe/Defaults variable casting and type detection
 * from: objects/Cast.js
 * @class Cast
 * @version 3.5
 * @requires javascript1.0+
 */
var Cast = {
    //version
    v:3.5,
    /**
     * convert anything to integer
     * @memberOf Class
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
     * convert anything to an array, good for functions converting arguments to a type
     * uses built-in .toArray method by default, breaks apart 1st layer of an object into an array
     * @param {mixed} [o] - variable to convert
     * @param {mixed} [df] - default to set ([] if omitted)
     * @return {Array} Array or default on error
     */
    carray : function(o,df)
    {
        if ( typeof df == 'undefined' )
            df = [];
        if ( typeof o == 'undefined' || !o)
            return df;
        if (this.isArray(o))
            return o;
        if (typeof o.toArray == "function")
            return o.toArray();
        if (typeof o.toArray == "object") {
            df = [];
            for(var i in o)
                df.push(o[i]);
            return df;
        }
        return [o];
    },
    /**
     * check if is array
     * @param {mixed} v - value to check
     * @return {boolean} 
     */
    isArray : function(v)
    {
        if (typeof v == "array")
            return true;
        if (typeof v == 'object' && v)
            if ( v.constructor == Array )
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
     * @param {mixed} [v] value to check
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
     * @return {boolean} boolean or default[false] on error
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
     * @param {mixed} [v] value to check
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
    },
    /**
     * safely traverse down object tree
     * @param {object/function/array} 0 the base object
     * @param {mixed} 1 default value
     * @param {string/array} 2+ chain of sub objects
     * @return {mixed} null on error
     */
    ctree : function()
    {
        if (! arguments.length)
            return null;
        if (arguments.length < 3 || arguments[0].length == 1)
            return arguments[0];
        
        if (Cast.isArray(arguments[2])) { //stretch argument[2] into separate arguments
            arguments[2].unshift(arguments[1]);
            arguments[2].unshift(arguments[0]);
            return this.ctree.apply(this, arguments[2]);
        }
        
        if (arguments[2] in arguments[0]) {
            a = [arguments[0][arguments[2]]];
            a.push(arguments[1]);
            for(var i=3; i<arguments.length;i++) //next item
                a.push(arguments[i]);
            return this.ctree.apply(this,a);
        }
        
        return arguments[1]; //not found
    },
    /**
     * Elements.cjqxhr
     * <div>This is useful when you want to ensure a function returns done/fail/always construct.</div>
     * <div>returns a jquery XHR object.  Passes through existing ones, migrates old jQuery to done/fail/always.  Creates one when jqxhr is boolean or jquery not found.</div>
     * @param {jQueryXHR|boolean} jqxhr - passes-through and backwards capatibles jQueryXHR objects.  Creates one when a boolean is sent (true=success, false=failure).
     * @param {string} [message] - the message to return when jqxhr is boolean
     * @return {jQueryXHR} always returns done/fail/always methods
     */
    cjqxhr : function(jqxhr, message)
    {
        if(typeof jqxhr == 'object' || typeof jqxhr == 'function') { //already is jqxhr
            if (done in jqxhr && fail in jqxhr && always in jqxhr) {
                return jqxhr;
            }
            else if (success in jqxhr && error in jqxhr && complete in jqxhr) { //old jQuery version
                jqxhr.done   = jqxhr.success;
                jqxhr.fail   = jqxhr.error;
                jqxhr.always = jqxhr.complete;
                return jqxhr;
            }
        }
        
        message = Cast.cstring(message);
        
        //not jqxhr, let's create one with jQuery
        if (typeof jQuery != 'undefined') {
            if (Deferred in jQuery) {
                var dfd = new jQuery.Deferred();
                if (jqxhr)
                    dfd.resolve(message,'success', dfd);
                else
                    dfd.reject(dfd,'error', message);
                return dfd.promise();
            }
        }
        
        //no available construct, let's fake one
        if (! jqxhr) {
            return  {
                "message": message,
                done: function(f){},
                fail: function(f){
                    f(jqxhr,'error', this.message);
                },
                always: function(f){
                    f(jqxhr,'error', this.message);
                }
            };
        }
        else {
            return  {
                "message": message,
                done: function(f){
                    f(this.message, 'success', this);},
                fail: function(f){},
                always: function(f){
                    f(this,'success', this.message);
                }
            };
        }
    }
};
,
    perform : function(f, a)
    {
        if (Cast.isFunction(f))
            if(Cast.isArray(a))
                f.apply(this,a);
            else
                f();
    },
    /**
     * returns a jQuery promise object - good for forcing a done promise object
     * @param {Object} o - the object to test
     * @param {Object} a - the arguments to return
     * @return jQuery.Deferred().promise();
     * //if(o.then && o.done && o.fail && o.always && o.pipe && o.progress && o.state)
     * //if(o.resolve && o.reject && o.notify && o.resolveWith && o.rejectWith && o.notifyWith)
     */
    cpromise : function(o, a)
    {
        if (this.isObject(o))
            if(!o.resolve && o.done) //promise object does not have resolve, deferred does
                return o;
            else if (typeof o.promise == 'function') //some functions include a promise function in the jQuery object when time is related (animate)
                return o.promise();
        if (typeof jQuery == 'function') //1.4+ includes a Deferred object
            if (typeof jQuery.Deferred == 'function')
                return jQuery.Deferred(function(dfo){
                    if (Cast.isArray(a))
                        dfo.resolve.apply(this, a);
                    dfo.resolve(a);
                }).promise();
        return { //just in case, lets invent a completed state
            "then"     : this.perform,
            "done"     : this.perform,
            "fail"     : this.perform,
            "always"   : this.perform,
            "pipe"     : "",
            "progress" : "",
            "state"    : ""
        };
    },
    /**
     * wraps a return value looking for promise
     * returns a jQuery promise object - good for forcing a done promise object
     * @param {Object} o - the object to test
     * @param {Object} a - the arguments to return
     * @return jQuery.Deferred().promise();
     * //if(o.then && o.done && o.fail && o.always && o.pipe && o.progress && o.state)
     * //if(o.resolve && o.reject && o.notify && o.resolveWith && o.rejectWith && o.notifyWith)
     */
    fdeferred : function(f)
    {
        if (typeof jQuery == 'function') //1.4+ includes a Deferred object
            if (typeof jQuery.Deferred == 'function')
                return jQuery.Deferred(f);
                
        dfd = {
            resolve : function() {
                //pass all args through to done on this return
            }
        }
        return function(dfd) {
            
        };

        //wraps a return that may or maynot have a promise function
        //adds a promise trigger to return a deferred
        //includes a variable that can be set to resolve, fail, etc
        //just make a deferred!?
        if (this.isObject(o))
            if(!o.resolve && o.done) //promise object does not have resolve, deferred does
                return o;
            else if (typeof o.promise == 'function') //some functions include a promise function in the jQuery object when time is related (animate)
                return o.promise();
        if (typeof jQuery == 'function') //1.4+ includes a Deferred object
            if (typeof jQuery.Deferred == 'function')
                return jQuery.Deferred(function(dfo){
                    if (Cast.isArray(a))
                        dfo.resolve.apply(this, a);
                    dfo.resolve(a);
                }).promise();
        return { //just in case, lets invent a completed state
            "then"     : this.perform,
            "done"     : this.perform,
            "fail"     : this.perform,
            "always"   : this.perform,
            "pipe"     : "",
            "progress" : "",
            "state"    : ""
        };
    },
    
    /**
     * safely traverse down object tree
     * @param {mixed} 0 the base object
     * @param {string} 1+ chain of sub objects
     * @return null on error
     */
    ctree : function()
    {
        if (typeof arguments == 'undefined' || !arguments.length)
            return null;
        if (arguments.length == 1)
            return arguments[0];
        if (typeof arguments[0] == "object" && arguments[1] in arguments[0]) {
            a = [arguments[0][arguments[1]]];
            for(var i=2; i<arguments.length;i++)
                a.push(arguments[i]);
            return this.ctree.apply(this,a);
        }
        return null;
    },
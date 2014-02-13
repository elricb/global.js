/**
 * Element functions
 * From: objects/Elements.js
 * Terms:  jqo:jquery object, jqt:jquery object target, jq
 * @class Elements
 * @version 3.11
 * @requires jQuery1.3+
 * @requires Cast3.5+
 * @alias Elements
 * @classDescription tools that affect html elements
 * @property {Integer} pxToIn number of pixels in an inch (0 if jQuery not include before)
 * @property {Float} version
 * @property {function} isHTMLElement(domObject) determines if this is a dom element variable
 * @property {function} add(jqo) add a jQuery object to Elements.o[]
 * @property {function} get(integer) get a jQuery object from Elements.o[]
 * @property {function} populate(string,json,rex) populate an html string with json data
 *      <ul>
 *          <li>{{var}} loop recursively if object/function/array, </li>
 *          <li>{{var}} insert var value, </li>
 *          <li>{{var.var.var}} insert var chain value, </li>
 *      </ul>
 * @property {function} populateTag(string,json,tag,rex) populate an html string with json data
 *      <ul>
 *          <li>{{var}} loop recursively if object/function/array, </li>
 *          <li>{{var}} insert var value, </li>
 *          <li>{{var.var.var}} insert var chain value, </li>
 *      </ul>
 * @property {function} overlay(source) tbd
 * @property {function} checkBox(jqo,on,off,boolean) adds custom on/off image to checkbox
 * @property {function} setLinks(jqo) converts elements to links if they have href attribute and optionally target attribute
 * @property {function} centerParent(target,container) centers target in container (css does a poor job of vertical alignment for liquid elements)
 * @property {function} centerArea(jqo,width,height) centers an element in an area
 * @property {function} toggle(target,source,{w:false,h:true,t:false}) toggles target when source is clicked, target throws toggled
 * @property {function} afterResize(jqo) triggers afterresize event for jQuery element
 * @property {function} unifyDimensions(jqo,[width],[height]) makes all jquery elements unified dimensions to largest element.
 * @property {function} resize(jqo,w,h,[speed]) resize element(s) and throw afterresize event
 * @property {function} loading(url,jquery) show a loading image, centered in element {<pre>
 * loading.show() - shows loading image
 * loading.hide() - hides loading image
 * </pre>}
 */
var Elements = {
    version : 3.12,
    o       : [],     //stored jquery elements (attach id# to element)
    tick    : 200,    //resize timer tick for 'afterresize' event
    timeout : false,  //performing resize
    pxToIn  : 0       //physical aspect ratio
};  //functions shared across all elements
/**
 * Image functions
 * From: objects/Elements.js
 * @class Images
 * @version 1.2
 * @requires jQuery1.3+
 * @requires Cast
 * @requires DOMImage
 * @alias Images
 * @classDescription tools that affect html images
 */
var Images = {
    version:1.2
};  //functions shared across all images

(function () {
   "use strict";

/**
 * Elements.getPxToIn
 * Returns the number of pixels in a physical area inch
 * @method
 * @return {Integer} pixels
 */
Elements.getPxToIn = function()
{
    return Cast.cint(jQuery("<div style='display:block;position:relative;width:1in;margin:0px;padding:0px;border:none;' />").width());
};
/**
 * Elements.isHTMLNode
 * @method
 * @memberOf Elements
 * @param {HTMLObject/jQuery/Object}
 * @return {Boolean} if type node
 */
Elements.isHTMLNode = function(o){
    return (
        typeof Node === "object" ? o instanceof Node : 
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
};
/**
 * Elements.isHTMLElement
 * @method
 * @memberOf Elements
 * @param {HTMLObject|jQuery|Object}
 * @return {Boolean} if type html element
 */
Elements.isHTMLElement = function(o){
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
};
/**
 * Elements.isHTMLObject
 * @method
 * @param {HTMLObject|jQuery|Object} o
 * @return {Boolean} if type html object
 */
Elements.isHTMLObject = function(o){
    return (Elements.isHTMLElement() || Elements.isHTMLNode());
};
/**
 * Elements.getSelector - gets a text selector for element
 * @method
 * @param {HTMLObject|jQuery|Object} o
 * @return {string} the selector
 */
Elements.getSelector = function(o){
    var selector = $(this).parents()
                    .map(function() { return this.tagName; })
                    .get().reverse().join(" ");

    if (selector) { 
      selector += " "+ $(this)[0].nodeName;
    }

    var id = $(this).attr("id");
    if (id) { 
      selector += "#"+ id;
    }

    var classNames = $(this).attr("class");
    if (classNames) {
      selector += "." + $.trim(classNames).replace(/\s/gi, ".");
    }

    return selector;
};
/**
 * Elements.add
 * Adds a jQuery object to Elements.o array and returns the array index (used by Elements.get).  
 * Good for when you need attach an object reference to an element.
 * @method
 * @param {HTMLObject|jQuery|Selector-String} o
 * @return {Integer} index
 */
Elements.add = function(o) {
    var ie = Elements.o.length;
    Elements.o[ie] = Cast.cjquery(o);
    return ie;
};
/**
 * Elements.get
 * Get a jQuery object added via Elements.add. 
 * @param {Integer} o
 * @return {jQuery} index
 */
Elements.get = function(ie) {
    ie = Cast.cint(ie);
    if (ie < Elements.o.length)
        return Elements.o[ie];
    return jQuery();
};
/**
 * Elements.popTemplateString
 * @deprecated replaced by fillTemplate
 * @param {string} template - the template
 * @param {json} r1 - keys and values to replace
 * @param {json} r2 - keys and values to replace
 * @return {string} new template
 */
Elements.popTemplateString = function(template, r1, r2) 
{
    template = Cast.cstring(template);
    r1 = Cast.cjson(r1);
    r2 = Cast.cjson(r2);
    return template.replace(/{(\w+)}/g, function($0,$1){
        if (typeof r1[$1] != 'undefined')
            return r1[$1];
        if (typeof r2[$1] != 'undefined')
            return r2[$1];
        return $1;
    });
};
/**
 * loadFile simple ajax loader
 * @param {url-string} url - the source file url
 * @param {string} [type] - "json" | "text" | "html"  default: text
 * @return {jQueryXHR} new template
 */
Elements.loadFile = function(url, type, data) 
{
    type = Cast.cstring(type, "text");
    data = Cast.cobject(data);
    
    return Cast.cjqxhr(jQuery.ajax({
        url: url,
        data: data,
        dataType: type
    }));
};
/**
 * populate fills a string with json data using regular expression replace.
 * @todo a file embeding method better than non-async
 * @todo what about numerical keys?
 * @param {string} source - the source template
 * @param {json|object|string-json} struct - keys and values to replace
 * @param {string} rex - the regular expression to replace, uses second result
 * @return {string} new template
 * @example
 *      <ul>
 *          <li>{{var.var.var}} use periods to traverse down next level</li>
 *          <li>{{var}} if object, loop over this entry recursively</li>
 *          <li>{{var}} if variable found, show this value</li>
 *          <li>{{var}} if variable not found, assume file and load as next template, </li>
 *      </ul>
 */
Elements.populate = function(template, struct, rex) 
{
    rex = typeof rex == 'undefined' ? /\{\{(.+?)\}\}/g : rex;
    
    return template.replace(rex, function($0,$1){
        var item  = Cast.cstring($1).split("."),
            value = Cast.ctree(struct, false, $1) || Cast.ctree(struct, null, item),
            r = "";
        
        if (value && typeof value == 'object' || typeof value == 'function' || typeof value == 'array') {
            if (value.constructor == Object || value.constructor == Array || value.constructor == Function) {
                if (typeof jQuery == 'function' && jQuery.isEmptyObject(value))
                    return ""; //fill area with blank
                return Elements.populate(template, value, rex);
            }
        }
        
        if (value != null)
            return value;
        
        //lets get the file sequentially (could be slow)
        //for (;value = Cast.ctree(struct, null, item) == null && item.length;item.pop()); //lets find if there's a partial to start from
        
        if (typeof jQuery == 'function' && item.length)
            jQuery.ajax({
                url      : item.join("."),
                async    : false,
                dataType : "text",
                success  : function(data) {
                    r += Elements.populate(data, value || struct, rex);
                }
            });
        
        return r;
    });
};
/**
 * populateTag populates a string with json tag using an html tag format
 * @requires Elements.populate
 * @requires jQuery
 * @param {string} source - the source template
 * @param {json|object|string-json} struct - keys and values to replace
 * @param {string} rex - the regular expression to replace, uses second result
 * @return {string} new template
 * @example
 *      <ul>
 *          <li>&lt;tplt&gt; open tag for templating</li>
 *          <ul>attributes
 *          <li>rex="" - {regularexpression} if regular expression matches value, do this</li>
 *          <li>key="" - {string} the key to use (otherwise use structure root)</li>
 *          <li>loop="" - {boolean} loops arrays/objects/functions, but this value overrides</li>
 *          </ul>
 *          <li>&lt;/tplt&gt; close tag for templating</li>
 *      </ul>
 */
Elements.populateTag = function(template, struct, tag, regex) 
{
    tag      = typeof tag == 'undefined' ? "tpt" : tag;
    template = jQuery("<div>" + template + "</div>");
    var tags = template.find(tag);
    
    tags.each(function(data){
        var jqo   = jQuery(this),
            key   = Cast.cstring(jqo.attr("key")),
            value = Cast.ctree(struct,null,key),
            sss   = val || struct,
            rex   = Cast.cstring(jqo.attr("rex"));
        
        if (rex && value && ! RegExp(rex).test(value)) {
            jqo.html("");
            return true; //continue;
        }
        
        if (value && typeof value == 'object' || typeof value == 'function' || typeof value == 'array') {
            if (value.constructor == Object || value.constructor == Array || value.constructor == Function) {
                value = value || struct;
                if (Cast.cboolean(jqo.attr("loop"))) {
                    var s = "";
                    for (var i in value) {
                        s += Elements.populate(jqo.html(), value[i], regex);
                    }
                    jqo.html(s);
                    return true; //same as continue;
                }
                jqo.html(
                    Elements.populate(jqo.html(), value, regex)
                );
            }
        }
        
        jqo.html(
            Elements.populate(jqo.html(), struct, regex)
        );
    });
    
    return template.html();
};
/**
 * Elements.overlay
 * <div>Simple overlay generation.  fadeIn when content loaded.</div>
 * @todo create this function
 * @param {json} settings
 *      <ul>{
 *          <li>"url"  : {string} target url html contents</li>
 *          <li>"html" : {string} html contents</li>
 *      }</ul>
 * @return {jqxhr} done, fail and always methods are returned
 */
Elements.overlay = function(source)
{
    return Cast.cjqxhr(false, 'function not created');
};
/**
 * Assign custom images to the checkbox on/off state.  
 * Changes original checkbox state and works seamlessly in forms.  
 * Works down to IE6, then gracefully degrades into a regular checkbox.
 * @method
 * @memberOf Elements
 * @param {string|jquery} cb - the checkbox element
 * @param {url} imgOn - the checked image link
 * @param {url} imgOff - the unchecked image link
 * @param {boolean} [bOn] - default checked state
 * @return {jquery} the new check element
 * @fires change
 */
Elements.checkBox = function(cb, imgOn, imgOff, bOn) 
{
    cb = Cast.cjquery(cb);
    if (! cb.length)
        return jQuery();
    
    bOn = Cast.cboolean(bOn);
    
    cb.after("<img />");
    var customBox = cb.next("img");
    
    customBox
        .attr("imgOn", imgOn)
        .attr("imgOff", imgOff)
        .attr("src", ((bOn)?imgOn:imgOff) )
        .show();
    
    if(bOn)
        cb.attr('checked', 'checked');
    else
        cb.removeAttr('checked'); //override css setting
    
    cb.hide();
        
    customBox.click(function() {
        var jqCheck = jQuery(this).prev(); 
        if ( ! jqCheck.attr('checked')) 
            jqCheck.attr('checked', 'checked');
        else
            jqCheck.removeAttr('checked');
        jqCheck.change();
    });
    
    cb.change(function(e){
        var cust = jQuery(e.target).next("img");
        cust.attr("src", cust.attr(((!!jQuery(this).attr('checked'))?"imgOn":"imgOff")) );
        return true;
    });
    
    return customBox;
};
/**
 * With attributes href and target, converts any element into an anchor/link (e.g. <div href='link.html'></div>)
 * @param {jquery|string} s - selector or object to add link to (tracks clicks)
 * @return {this}
 */
Elements.setLink = function(s) 
{
    s = Cast.cjquery(s);
    s.css("cursor", "pointer");
    s.click(function() {
        var e = jQuery(this);
        var href = Cast.cstring(e.attr("href"));
        var target = Cast.cstring(e.attr("target"));
        if (href) {
            if(target)
                window.open(href, target);
            else
                window.location.href = href;
        }
    });
    return this;
};
/**
 * Determines width and height of container based on container options
 * @param {jquery} ele - the contained jquery element
 * @param {json} options - container options
 *      <ul>{
 *          <li>"parent" : {HTMLobject|jQuery}</li>
 *          <li>"width"  : {Integer}</li>
 *          <li>"height" : {Integer}</li>
 *      }</ul>
 * @return {json} width/height - defaults to window width/height
 */
Elements.getContainer = function(ele, container)
{
    var parent = jQuery();
    container  = Cast.cobject(container);
    
    //Check if parent search is defined (accepts search string, jquery objects and html elements)
    if ( Cast.isString(container.parent) ) {
        parent = ele.parents(container.parent);
    }
    else if ( Cast.isObject(container.parent) ) {
        parent = Cast.cjquery(container.parent);
    }
    else if ( Cast.cboolean(container.parent) ) {
        parent = ele.parent();
    }
    
    //override width/height
    if ( parent.length ) {
        container.width  = parent.width();
        container.height = parent.height();
    }
    
    if ( Cast.cint(container.width) && Cast.cint(container.height) )
        return {"width":container.width, "height":container.height, "jq": parent};
    
    parent = (ele.parent());
    if ( ! parent.length )
        parent = jQuery(window);
        
    return {"width":parent.width(), "height":parent.height(), "jq": parent};
};
/**
 * Centers an element within a container
 * @param {jquery} ele - jquery element to center
 * @param {json} options - center options ([parent], [width], [height], [position])
 * @return {jquery} ele
 */
Elements.center = function(ele, settings) 
{  
    var k,
        itop,
        ileft,
        pos,
        data = {
            parent     : false, //parent element selector to fit into
            width      : 0,     //width to fit into
            height     : 0,     //height to fit into
            vertical   : true,
            horizontal : true,
            persist    : true
        };
    
    ele = Cast.cjquery(ele);
    settings = Cast.cobject(settings);
    
    for (k in data) {    
        data[k] = (typeof settings[k] != 'undefined')? settings[k] : data[k]; 
    }
    
    container = Elements.getContainer(ele, data);
    parent    = container.jq;
    
    if ( ! parent.length || (data.horizontal && ! data.vertical)) {
        if (Cast.cint(container.width) && Cast.cint(container.height))
            return Elements.centerArea(ele, container.width, container.height);
        return ele.css({
            "margin-left"    : "auto",
            "margin-right"   : "auto",
            "vertical-align" : "middle"
        });
    }
    
    if (data.persist)
        return Elements.centerParentResize(ele, parent);
    
    return Elements.centerParent(ele, parent);
};
/**
 * Center element in parent element
 * @param {jquery} jqe centered element
 * @param {jquery} jqp parent container (usually window)
 * @return {jquery} jqe
 */
Elements.centerParent = function(jqe, jqp)
{
    var pos = Cast.cstring(jqe.css("position"));
    if ( pos == "absolute" || pos == "fixed")
        return jqe.css({
            "left" : Math.round( ((jqp.outerWidth() || jqp.width())/2) - ((jqe.outerWidth() || jqe.width())/2) ) + "px", 
            "top"  : Math.round( ((jqp.outerHeight() || jqp.height())/2) - ((jqe.outerHeight() || jqe.height())/2) ) + "px"
        });
    return jqe.css({
        "margin-left" : Math.round( ((jqp.outerWidth() || jqp.width())/2) - ((jqe.outerWidth() || jqe.width())/2) ) + "px", 
        "margin-top"  : Math.round( ((jqp.outerHeight() || jqp.height())/2) - ((jqe.outerHeight() || jqe.height())/2) ) + "px"
    });
};
/**
 * Center element in a specified height/width pixels
 * @param {jquery} jqe centered element
 * @param {int} width
 * @param {int} height
 * @return {jquery} jqe
 */
Elements.centerArea = function(jqe, w, h)
{
    var pos = Cast.cstring(jqe.css("position"));
    if ( pos == "absolute" || pos == "fixed")
        return jqe.css({
            "left" : Math.round( (w/2) - ((jqe.outerWidth() || jqe.width())/2) ) + "px", 
            "top"  : Math.round( (h/2) - ((jqe.outerHeight() || jqe.height())/2) ) + "px"
        });
    return jqe.css({
        "margin-left" : Math.round( (w/2) - ((jqe.outerWidth() || jqe.width())/2) ) + "px", 
        "margin-top"  : Math.round( (h/2) - ((jqe.outerHeight() || jqe.height())/2) ) + "px"
    });
};

/**
 * Center element into parent and re-center element on 'afterresize' events.  Invokes event if not already invoked.
 * @param {jquery} jqp parent container (usually window)
 * @param {jquery} jqe centered element
 * @return {jquery} jqe
 */
Elements.centerParentResize = function(jqe, jqp)
{
    jqe = Cast.cjquery(jqe);
    jqp = Cast.cjquery(jqp);
    Elements.centerParent(jqe, jqp);

    if (typeof jqp.on != 'function')
        return jqp.bind('resize', function(){
            Elements.centerParent(jqe, jqp);
        });

    Elements.startAfterResizeEvent(jqp);
    return jQuery(jqp).on('afterresize', 
        {"jqp":jqp,"jqe":jqe},
        function(e){
            Elements.centerParent(e.data.jqe, e.data.jqp);
        }
    );
};
/**
 * toggle - clicking jqt will toggle jqo open/closed
 * uses Elements.add to keep entire tree in memory - probably need another way to go about it
 * @param {jquery/string} jqo - target element
 * @param {jquery/string} jqt - triggering element
 * @param {json} opts - options
 * {<pre>
 *  "w" : {int|bool} resize width
 *  "h" : {int|bool} resize height
 *  "t" : {boolean} is open/closed (default open)
 * </pre>}
 * @fires toggled
 */
Elements.toggle = function(jqo, jqt, opts)
{
    opts = Cast.cjson(opts);  //options: w=width use, h=height use, t=start open/closed
    jqo  = Cast.cjquery(jqo); //toggle target
    jqt  = Cast.cjquery(jqt); //toggle trigger
    opts["j"] = Elements.add(jqo); //convert to jquery object to int to attach to data
    opts["t"] = Cast.cboolean(opts["t"],true); //default open
    opts["w"] = Cast.cboolean(opts["w"],false);
    opts["h"] = Cast.cboolean(opts["h"],true);
    if (! (jqo.width() && jqo.height())) { //closed, get size through clone
        var elem = jqo.clone().css({"height":"auto","width":"auto"}).appendTo("body");
        if(opts["h"])
            opts["h"] = elem.height();
        if(opts["w"])
            opts["w"] = elem.width();
        elem.remove();
    }
    if (opts["w"])
        opts["w"] = Math.max(jqo.width(), Cast.cint(opts["w"])); //use target width, unless passed width is larger
    if (opts["h"])
        opts["h"] = Math.max(jqo.height(), Cast.cint(opts["h"])); //use target height, unless passed width is larger
    
    jqt.data("toggle", Cast.csjson(opts));
    
    jqt.click(function(ev){
        var ajqo = jQuery(ev.target),
            o = Cast.cjson(ajqo.data("toggle"));
        o["t"] = Cast.cboolean(o["t"]);
        var w = Cast.cint(o["w"]),
            h = Cast.cint(o["h"]),
            j = Elements.get(Cast.cint(o["j"]));
        if (w)
            if(o["t"]) //is open, close
                j.animate({"width":0},function(){
                    o["t"] = false;
                    ajqo.data("toggle",Cast.csjson(o));
                });
            else //is closed, open
                j.animate({"width":w},function(){
                    o["t"] = true;
                    ajqo.data("toggle",Cast.csjson(o));
                });
        if (h)
            if(o["t"]) //is open, close
                j.animate({"height":0},function(){
                    o["t"] = false;
                    ajqo.data("toggle",Cast.csjson(o));
                });
            else //is closed, open
                j.animate({"height":h},function(){
                    o["t"] = true;
                    ajqo.data("toggle",Cast.csjson(o));
                });
        jqo.trigger("toggled");
    });
};
/**
 * The 'afterresize' event triggers after a window is resized.  This speeds up actions that rely on window size.  
 * This function starts the afterresize event. It only needs to be called once per jqp (self checks if it's already called.)
 * @param {HTMLObject|jQuery} [jqp] basically this is the window object 99% of the time
 */
Elements.startAfterResizeEvent = function(jqp)
{
    if (typeof Elements.startAfterResizeEventOn != 'undefined') //run only once - should probably force a run at startup
        return;
    if (typeof jqp == 'undefined')
        jqp = window;
    Elements.startAfterResizeEventOn = true;
    Elements.timeout = false;

    $(jqp).on('resize', 
        {"jqp":jqp},
        function() {
            Elements.windowTime = new Date();
            if (Elements.timeout === false) {
                Elements.timeout = true;
                setTimeout(Elements.afterResize, Elements.tick);
            }
        }
    );
};
/**
 * triggers "afterresize" event
 * @fires afterresize
 */
Elements.afterResize = function(e)
{
    if (new Date() - Elements.windowTime < Elements.tick) {
        setTimeout(Elements.afterResize, Elements.tick);
    } else {
        Elements.timeout = false;
        /**
         * afterResize event.
         * @event afterresize
         * @type {jQuery:event}
         */
        jQuery(window).trigger("afterresize");
    } 
};
/**
 * Stores data on the element.  This function needs updating.
 * @private
 * @param {jquery} jqo - the jquery element
 * @param {string} [dataSet] - the subset of data to save
 * @param {json} [data] - the data to save
 * @return {json} the image data
 */
Elements.elementData = function(jqo, set, newData)
{
    var data = {};
    jqo = Cast.cjquery(jqo);
    if (typeof set == 'object') {
        newData = set;
        set = "default";
    } else {
        set = Cast.cstring(set);
        if ( ! set )
            set = "default";
    }
    Cast.cjson(newData);
    
    jqo.each(function(){
        data = Cast.cjson(jqo.data(set));
        jQuery.extend(data, newData);
        jqo.data(set, data);
    });
    
    return data;
};
/**
 * Resizes all matches to the largest dimensions
 * @param {jquery|selector-string} jqo - many jquery objects
 * @param {boolean} w - unify width
 * @param {boolean} h - unify height
 * @return {jquery} jqo - .length = 0 on error
 */
Elements.unifyDimensions = function(jqo, w, h)
{
    var maxw = 0,
        maxh = 0;
    w   = Cast.cboolean(w,true);
    h   = Cast.cboolean(h,true);
    jqo = Cast.cjquery(jqo);
    jqo.each(function(){
        ajqo = $(this);
        if (ajqo.width() > maxw)
            maxw = ajqo.width();//Math.max(ajqo.width(), ajqo.outerWidth());
        if (ajqo.height() > maxh)
            maxh = ajqo.height();//Math.max(ajqo.height(), ajqo.outerHeight());
    });
    jqo.each(function(){
        ajqo = $(this);
        if (w)
            ajqo.width(maxw);
        if (h)
            ajqo.height(maxh);
    });
    return jqo;
};
/**
 * Resizes element to new width/height all css units accepted
 * @param {jquery|selector-string} jqo - one jquery object
 * @param {string|int} w - new width
 * @param {string|int} h - new height
 * @param {int} effect - speed to animate to new size (0 = instant)
 * @return {jQuery} object - use "afterresize" event
 * @fires afterresize
 */
Elements.resize = function(jqo,w,h,effect)
{
    if ( Cast.isNumber(w) )
        w = Cast.cint(w)+"px";
    if ( Cast.isNumber(h) )
        h = Cast.cint(h)+"px";
    if (!w)
        w = jqo.width()+"px";
    if (!h)
        h = jqo.height()+"px";
    effect = Cast.cint(effect);

    if ( effect > 0 )
        return jqo.stop().animate({
            "width"  : w,
            "height" : h
        }, effect, function(){
            jqo.trigger("afterresize");
        });

    return jqo.css({
        "width"  : w,
        "height" : h
    }).trigger("afterresize");
};
/**
 * Creates a loading image, centered in the container.  Uses methods:
 * <ul>
 *      <li>Elements.loading.show()</li>
 *      <li>Elements.loading.hide()</li>
 * </ul>
 * @param {string} src - the image url
 * @param {selector-string|jquery} [container] - the container element - defaults to body
 * @return {jquery} the created image
 */
Elements.loading = function(src,container)
{
    Elements.loading.img  = $();
    src = Cast.cstring(src);
    container = Cast.cjquery(container);
    if (! container.length)
        container = jQuery("body");
    
    if (! (src && container.length)) {
        console.log("Elements.loading img error");
        return jQuery();
    }
    
    Elements.loading.img  = jQuery("<img src=\"" + src + "\" style=\"display:none;\" />");
    Elements.loading.img.appendTo(container);
    
    Elements.loading.img.load(function() {
        $(this).css({
            'position'    : 'fixed',
            'z-index'     : 10000,
            'left'        : '50%',
            'top'         : '50%',
            'margin-left' : '-' + (Elements.loading.img.width/2) + 'px',
            'margin-top'  : '-' + (Elements.loading.img.height/2) + 'px'
        });
    }).error(function(){
        console.log("Elements.loading img '"+ src +"' does not exist");
    });
    
    Elements.loading.src = src;
    return Elements.loading.img;
};
/**
 * Elements.loading.show
 * shows a loading image, after Elements.loading is called
 * @memberof Elements.loading
 */
Elements.loading.show = function() 
{
    if (Elements.loading.img.length)
        Elements.loading.img.fadeIn();
};
/**
 * Elements.loading.show
 * hides the loading image
 * @memberof Elements.loading
 */
Elements.loading.hide = function() 
{
    if (Elements.loading.img.length)
        Elements.loading.img.fadeOut();
};
/**
 * Sets if image is loaded, defaults to setting loaded = true
 * @param {jQuery|string} img - selector or jquery img element, assumes one element
 * @param {boolean} [b] sets loaded to true or false, default true.
 * @return this object
 */
Images.setLoaded = function(img, b)
{
    b = Cast.cboolean(b,true);
    Cast.cjquery(img).data("loaded", b);
    return this;
};
/**
 * Determines if image is loaded
 * @param {jQuery|string} img - selector or jquery img element, assumes one element
 * @return {boolean}
 */
Images.isLoaded = function(img)
{
    return Cast.cboolean(
        Cast.cjquery(img).data("loaded")
    );
};
/**
 * Preloads many image elements
 * @example
 *      Elements.loading("url");
 *      Elements.loading.show();
 *      Images.loadImages(".images").done(function(imgs){
 *          Elements.loading.hide();
 *          imgs.fadeIn();
 *      });
 * @param {jQuery|string} imgs - one to many jQuery img elements (can be jQuery element or selector string)
 * @return {jqXHR}
 */
Images.loadImages = function(imgs)
{
    imgs = Cast.cjquery(imgs);
    var that = this;
    
    return jQuery.Deferred(function(dfdpl){
        imgs.each(function(index, value){
            that.loadImage(jQuery(value)).done(function(w,h,img){
                if ( index >= (imgs.length-1) )
                    dfdpl.resolve(imgs);
            });
        });
        if ( ! imgs.length )
            dfdpl.reject(imgs, "no image elements to preload");
    }).promise();
};
/**
 * Preloads one image element and gets the width and height of the original image
 * @example
 *      Elements.loading("url");
 *      Elements.loading.show();
 *      Images.loadImage("#myimage").done(function(w, h, img){
 *          Elements.loading.hide();
 *          img.fadeIn();
 *      });
 * @param {jQuery} img - one jQuery img element
 * @return {jqXHR} theImage.width, theImage.height, img, errorString
 */
Images.loadImage = function(img)
{
    var that = this;
    return jQuery.Deferred(function(dfdobj){
        //make sure image is loaded, then pull original image size
        img = Cast.cjquery(img);
        var theImage = new Image(),
            src = Cast.cstring(img.attr("src"));
        theImage.onload = function(){
            Elements.elementData(img, {
                'owidth'  : theImage.width,
                'oheight' : theImage.height
            });
            that.setLoaded(img);
            dfdobj.resolve(theImage.width, theImage.height, img);
        };
        theImage.onerror = function(event){
            Elements.elementData(img, {
                'owidth'  : img.width(),
                'oheight' : img.height()
            });
            dfdobj.reject(img.width(), img.height(), img, "invalid src: "+src);
        };
        theImage.src = src;
        if(theImage.complete){
            Elements.elementData(img, {
                'owidth'  : theImage.width,
                'oheight' : theImage.height
            });
            that.setLoaded(img);
            dfdobj.resolve(theImage.width, theImage.height, img);
        }
        
    }).promise();
};
/**
 * Resize image to target height.  Uses aspect ratio to determine width.
 * @todo adjust element data to read original-width/original-height at the element root
 * @param {jquery} img - one img element
 * @return {int} the aspect ratio correct width in pixels
 */
Images.getRatioW = function(img, targetH)
{
    var iData = Cast.cobject(Elements.elementData(img));
    var rW = Cast.cint(iData['owidth'])/Cast.cint(iData['oheight']);
    if ( isNaN(rW) )
        return 0; 
    return targetH*rW;
};
/**
 * Resize image to target width.  Uses aspect ratio to determine height.
 * @todo adjust element data to read original-width/original-height at the element root
 * @param {jquery} img - one img element
 * @return {int} the aspect ratio correct height in pixels
 */
Images.getRatioH = function(img, targetW)
{
    var iData = Cast.cobject(Elements.elementData(img));
    var rH = Cast.cint(iData['oheight'])/Cast.cint(iData['owidth']);
    if ( isNaN(rH) )
        return 0;
    return targetW*rH;
};
/**
 * Resizes image to new width and aspect ratio height
 * @todo add ability to resize on px, in or percent - will need to size, get new size in px, then apply aspect ratio
 * @param {jquery} img - one img element
 * @param {string/int} w - new width
 * @param {int} effect - speed to animate to new size (0 = instant)
 * @return img object
 */
Images.resizeW = function(img, targetW, effect)
{
    return Elements.resize(
        img,
        targetW,
        this.getRatioH(img,targetW),
        effect
    );
};
/**
 * Resizes image to new height and aspect ratio width
 * @todo add ability to resize on px, in or percent - will need to size, get new size in px, then apply aspect ratio
 * @param {jquery} img - one img element
 * @param {string/int} h - new height
 * @param {int} effect - speed to animate to new size (0 = instant)
 * @return img object
 */
Images.resizeH = function(img, targetH, effect)
{
    return Elements.resize(
        img,
        this.getRatioW(img,targetH),
        targetH,
        effect
    );
};
/**
 * size an image inside a container (maintaining aspect ratio)
 * @param {jquery} img the image element to fit
 * @param {jquery/string} container - the jquery or selector of container
 * @param {int} speed - the fade in speed (0 for instant)
 * @param {boolean} unbound - false (default) fit largest side in container, true - fit smallest side to container (overflow happens)
 * @return {Images} this
 */
Images.fitInParent = function(img, container, speed, unbound)
{
    container = Elements.getContainer(img, container);
    return this.fitInArea(img, container.width, container.height, speed, unbound);
};
/**
 * size an image inside a width and height (maintaining aspect ratio)
 * @param {jquery} img the image element to fit
 * @param {int} w the containing width
 * @param {int} h the containing height
 * @param {int} speed - the fade in speed (0 for instant)
 * @param {boolean} unbound - false (default) fit largest side in container, true - fit smallest side to container (overflow happens)
 * @return {Images} this
 */
Images.fitInArea = function(img,w,h,speed,unbound)
{
    unbound = Cast.cboolean(unbound); //false: fit entire image in container, true: fit smallest length to container  
    
    if ( unbound == (Math.abs(img.width()-w) < Math.abs(img.height()-h)) ) //largest side in comparison to container
        return this.resizeW(img,w,speed);
    return this.resizeH(img,h,speed);
};
/**
 * resize images based on container
 * @param {jQuery/string} selector - one to many jquery img elements
 * @param {json} [options] - resize options
 * @return {jqXHR} deferred object
 */
Images.fitImages = function(imgs, options)
{
    var imgs = Cast.cjquery(imgs);
    var that = this;
    
    return jQuery.Deferred(function(dfdfi){
        
        imgs.each(function(index, value){ 
            that.fitImage(jQuery(value), options).done(function(w,h,img){
                if ( index >= (imgs.length-1) )
                    dfdfi.resolve(img);
            });
        });
        if ( ! imgs.length )
            dfdfi.reject(imgs);
        
    }).promise();
};
/**
 * resize an image based on container
 * @param {jQuery/string} selector - one jquery img element
 * @param {json} [options] - resize options
 * @return {jqXHR} deferred object
 */
Images.fitImage = function(img, options)
{
    var that = this;
 
    return this.loadImage(img).done(function(w,h,img) {
        data = {
            parent:false, //parent element selector to fit into
            width:0,      //width to fit into
            height:0,     //height to fit into
            speed:0,  //resize speed (animates resize if greater than zero)
            bound:true    //keeps image within container if true, or sizes to largest boundry.
        };
        jQuery.extend(data, Cast.cobject(options) );
        Elements.elementData(img, "container", data);
        
        var container = Elements.getContainer(img, data);
        that.fitInArea(img, container.width, container.height, data.speed, !data.bound);
    });
};
/**
 * Preload/verify image url
 * @param {string} url full image url
 * @return {jqXHR}
 *      done(url, status, jqXHR)
 *      fail(jqXHR, status, errString, url) //mimic ajax
 */
Images.exists = function(url)
{
    return jQuery.Deferred(function(tdf){
        if ( typeof url == 'undefined' || ! url )
            tdf.reject(tdf,"fail","blank url", "");
            
        jQuery("<img src='"+url+"' />")
            .load(function(){
                tdf.resolve(url, "success", tdf);
            })
            .error(function(){
                tdf.reject(tdf,"fail","error loading image", url);
            });
    }).promise();
};
/**
 * <div>Load svg image when supported</div>
 * <div>If tag type = img, uses src.  Otherwise uses background-image.</div>
 * <div>For speed sake, set <img src="" height="px or css" width="px or css" svg="url" img="" /></div>
 * @example 
 *      $(document).ready(function(){
 *          Images.svg(".svgs");
 *      });
 * @param {selector-string|jquery} jqo - element(s) to swap
 * @param {string} svg - svg source (if omitted, use img attribute svg)
 */
Images.svg = function(jqo, svg)
{
    jqo = Cast.cjquery(jqo);
    svg = Cast.cstring(svg);
    if (! Images.svgSupported())
        return jqo;
    jqo.each(function(){
        var ajqo = $(this);
        if (! svg)
            svg = Cast.cstring(ajqo.attr("svg"));
        if (ajqo.prop("tagName") == "img")
            ajqo.attr("src", svg);
        else
            ajqo.attr("background-image", "url("+svg+")");
    });
    return jqo;
};
/**
 * Checks for svg support
 * @return {boolean}
 */
Images.svgSupported = function()
{
    if (typeof Images.bSvgSupported != "undefined")
        return Images.bSvgSupported;
    var img = document.createElement('img');
    img.setAttribute('src','data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D');
    Images.bSvgSupported = img.complete;
    return Images.bSvgSupported;
};


if (typeof jQuery==='function') {

    Elements.pxToIn = Elements.getPxToIn();
    
    jQuery.fn.fitIn = function(options)
    {
        return Images.fitImages(this, options);
    };
    
    jQuery.fn.preload = function()
    {
        return Images.loadImages(this);
    };
    
    jQuery.fn.resize = function(w,h,effect)
    {
        return Elements.resize(jQuery(this), w, h, effect);
    };
    
    jQuery.fn.center = function(options)
    {
        return Elements.center(jQuery(this), options);
    };

}


}());

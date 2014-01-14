Cast = jQuery = Node = HTMLElement = {};
/**
 * Element and Image functions
 * From: objects/Elements.js
 * dependancies:  jQuery1.3+, (deferreds) jQuery 1.6+, Cast, Image
 */
var Elements = {
    version : 3.11,
    o       : [],     //stored jquery elements (attach id# to element)
    tick    : 200,    //resize timer tick for 'afterresize' event
    timeout : false,  //performing resize
    pxToIn  : Cast.cint($("<div style='display:block;position:relative;width:1in;margin:0px;padding:0px;border:none;' />").width())
};  //functions shared across all elements
var Images = {
    version:1.2
};  //functions shared across all images

(function () {
   "use strict";


if (typeof jQuery==='function') {
/**
 * jquery plugins
 */
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

Elements.isHTMLNode = function(o){
    return (
        typeof Node === "object" ? o instanceof Node : 
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
};

Elements.isHTMLElement = function(o){
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
};

Elements.isHTMLObject = function(o){
    return (Elements.isHTMLElement() || Elements.isHTMLNode());
};

Elements.add = function(o) {
    var ie = Elements.o.length;
    Elements.o[ie] = Cast.cjquery(o);
    return ie;
};

Elements.get = function(ie) {
    ie = Cast.cint(ie);
    if (ie < Elements.o.length)
        return Elements.o[ie];
    return jQuery();
};
/**
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
 * @param {string} template - the template
 * @param {json} r1 - keys and values to replace
 * @param {json} r2 - keys and values to replace
 * @return {string} new template
 * template json values:
 *      value: var (or var.subvar.subsubvar)
 *      template: url (location of subtemplate)
 *      re: regularexpression (interpretation/conversion of variable)
 *      replace: on false replace with this {string}
 */
Elements.popTemplateComplex = function(template, r1) 
{
    template = Cast.cstring(template);
    r1 = Cast.cjson(r1);
    r2 = Cast.cjson(r2);
    return template.replace(/{(\w+)}/g, function($0,$1){
        var item = Cast.cjson($1),
            value = Cast.cstring(item.value).split(".");
        
        value = Cast.ctree(r1,value);
        if(value == null)
            value = {};
        
        if (Cast.cstring(item.template)) {
            var subtemplate="";
            $.ajax({
                url: item.template,
                async: false,
                dataType: "text",
                success: function(data){
                    subtemplate = Elements.popTemplateComplex(data, r1);
                }
            });
            return subtemplate;
        }
        
        if (typeof r1[val.value] != 'undefined')
            return r1[val.value];
        
        return "";
    });
};
/**
 * @param {string} url - the template url/file location
 * @param {json} r1 - keys and values to replace
 * @param {json} r2 - keys and values to replace
 * @return {string} new template
 * template json values:
 *      value: var (or var.subvar.subsubvar)
 *      template: url (location of subtemplate)
 *      re: regularexpression (interpretation/conversion of variable)
 *      replace: on false replace with this {string}
 */
Elements.popTemplateFileComplex = function(url)
{
    return Elements.jqxhrCompat($.ajax({
        url: url,
        async: false,
        dataType: "text"
    }));
};
/**
 * wrap jqxhr returns with this to ensure methods done/fail/always exist
 * jQuery 1.4-1.8 jqXHR.success(), jqXHR.error(), and jqXHR.complete()
 * jQuery 1.8-2.0 jqXHR.done(data, textStatus, jqXHR), jqXHR.fail(jqXHR, textStatus, errorThrown), and jqXHR.always(data|jqXHR, textStatus, jqXHR|errorThrown)
 */
Elements.jqxhrCompat = function(jqxhr)
{
    if(! (typeof jqxhr == 'object' || typeof jqxhr == 'function')) {
        return {
            done: function(f){},
            fail: function(f){
                f(jqxhr,'error','promise object did not return fail method');
            },
            always: function(f){
                f(jqxhr,'error','promise object did not return fail method');
            }
        };
    }
    if (typeof jqxhr.done != 'function' && typeof jqxhr.success == 'function') {
        jqxhr.done   = jqxhr.success;
        jqxhr.fail   = jqxhr.error;
        jqxhr.always = jqxhr.complete;
    }
    return jqxhr;
};
/**
 * Assign custom images to replace checkbox
 * compatibility:  jQuery 1.0+, 
 * @param {string/jquery} checkBox - the checkbox element
 * @param {url} imgOn - the checked image link
 * @param {url} imgOff - the unchecked image link
 * @param {boolean} [bOn] - default checked state
 * @return {jquery} the new check element
 * @event checkbox.change()
 */
Elements.checkBox = function(checkBox, imgOn, imgOff, bOn) 
{
    checkBox = Cast.cjquery(checkBox);
    if (! checkBox.length)
        return jQuery();
    
    bOn = Cast.cboolean(bOn);
    
    checkBox.after("<img />");
    var customBox = checkBox.next("img");
    
    customBox
        .attr("imgOn", imgOn)
        .attr("imgOff", imgOff)
        .attr("src", ((bOn)?imgOn:imgOff) )
        .show();
    
    if(bOn)
        checkBox.attr('checked', 'checked');
    else
        checkBox.removeAttr('checked'); //override css setting
    
    checkBox.hide();
        
    customBox.click(function() {
        var jqCheck = jQuery(this).prev(); 
        if ( ! jqCheck.attr('checked')) 
            jqCheck.attr('checked', 'checked');
        else
            jqCheck.removeAttr('checked');
        jqCheck.change();
    });
    
    checkBox.change(function(e){
        var cust = jQuery(e.target).next("img");
        cust.attr("src", cust.attr(((!!jQuery(this).attr('checked'))?"imgOn":"imgOff")) );
        return true;
    });
    
    return customBox;
};
/**
 * With attributes href and target, converts any element into an anchor (e.g. <div href='link.html'></div>)
 * @param {jquery/string} s - selector to convert elements into links (tracks clicks)
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
 * Center element in parent
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
 * Center element in height/width
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
 * Create an event to center parent on change
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
 * @param {jquery/string} jqo - target element
 * @param {jquery/string} jqt - triggering element
 * @param {json} opts - options
 *  {int/bool} w - resize width
 *  {int/bool} h - resize height
 *  {bool} t - is open/closed (default open)
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
        elem = jqo.clone().css({"height":"auto","width":"auto"}).appendTo("body");
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
    
    jqt.click(function(){
        ajqo = $(this);
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
 * afterresize trigger events
 * startAfterResizeEvent(targetElement);
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
 */
Elements.afterResize = function(e)
{
    if (new Date() - Elements.windowTime < Elements.tick) {
        setTimeout(Elements.afterResize, Elements.tick);
    } else {
        Elements.timeout = false;
        jQuery(window).trigger("afterresize");
    } 
};
/**
 * When image functions are performed, image data is stored on the element
 * In the case of multiple elements, it always returns the data of the first
 * @param {jquery} img - the jquery element
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
 * @param {jquery} jqo - many jquery objects
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
 * Resizes image to new width/height all css units accepted
 * @param {jquery} jqo - one jquery object
 * @param {string/int} w - new width
 * @param {string/int} h - new height
 * @param {int} effect - speed to animate to new size (0 = instant)
 * @return {jQuery} object - use "afterresize" event
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
 * shows a loading image
 * @param {string} src - the image url
 * @param {string/jquery} container the container element - defaults to body
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
Elements.loading.show = function() 
{
    if (Elements.loading.img.length)
        Elements.loading.img.fadeIn();
};
Elements.loading.hide = function() 
{
    if (Elements.loading.img.length)
        Elements.loading.img.fadeOut();
};
/**
 * Sets if image is loaded, defaults to setting loaded = true
 * @param {jQuery/string} img - selector or jquery img element, assumes one element
 * @param {boolean} [b] - optional, sets loaded to true or false, default true.
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
 * @param {jQuery/string} img - selector or jquery img element, assumes one element
 * @return {boolean}
 */
Images.isLoaded = function(img)
{
    return Cast.cboolean(
        Cast.cjquery(img).data("loaded")
    );
};
/**
 * Prelaods many image elements
 * @param {jQuery/string} imgs - one to many jQuery img elements (can be jQuery element or selector string)
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
 * Depends on image being loaded
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
 * Depends on image being loaded
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
 * @param {jquery/string} the jquery or selector of container
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
 * @param {int} w/h the containing width and height
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
 * Load svg image when supported
 * If tag type = img, uses src.  Otherwise uses background-image.
 * @param {string/jquery} jqo - element(s) to swap
 * @param {string} svg - svg source (if omitted, use tag svg)
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

}());

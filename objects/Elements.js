/**
 * Element and Image functions
 * From: objects/Elements.js
 * dependancies:  jQuery1.3+, (deferreds) jQuery 1.6+, Cast, Image
 */
var Elements = {
    version : 3.4,
    o       : [],    //stored jquery elements (attach id# to element)
    tick    : 200,   //resize timer tick for 'afterresize' event
    timeout : false  //performing resize
}; //functions shared across all elements
var Images = {
    version:1.2
};   //functions shared across all images


if (typeof jQuery=='function') {
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
    ie = Elements.o.length;
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
        function(e){console.log("trig triggered");
            Elements.centerParent(e.data.jqe, e.data.jqp);
        }
    );
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
        Elements.timeout = false; console.log("set trigger");
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
 * Resizes image to new width/height all css units accepted
 * @param {jquery} img - one img element
 * @param {string/int} w - new width
 * @param {string/int} h - new height
 * @param {int} effect - speed to animate to new size (0 = instant)
 * @return img object
 */
Elements.resize = function(img,w,h,effect)
{
    if ( Cast.isNumber(w) )
        w = w+"px";
    if ( Cast.isNumber(h) )
        h = h+"px";
    effect = Cast.cint(effect);
    
    if ( effect > 0 )
        return img.animate({
            "width"  : w,
            "height" : h
        }, effect);
    
    return img.css({
        "width"  : w,
        "height" : h
    });
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

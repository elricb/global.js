/**
 * Element and Image functions
 * From: objects/Elements.js
 * dependancies:  jQuery1.3+, (deferreds) jQuery 1.6+, Cast, Image
 */
var Elements = {
    version:3.3
}; //functions shared across all elements
var Images = {
    version:1.1
};   //functions shared across all images

if ( typeof Cast != 'object' )
    var Cast={
        v:3,
        cint:function(a,b){"undefined"==typeof b&&(b=0);if("undefined"==typeof a)return b;a=parseInt(a,10);return isNaN(a)?b:a},
        cfloat:function(a,b){"undefined"==typeof b&&(b=0);if("undefined"==typeof a)return b;a=parseFloat(a,10);return isNaN(a)?b:a},
        isNumber:function(a){return"number"==typeof a||"object"==typeof a&&a&&a.constructor==Number?!0:!1},
        cobject:function(a,b){"undefined"==typeof b&&(b={});return"object"==typeof a&&a?a:b},
        isObject:function(a){return"object"==typeof a&&a?!0:!1},
        cstring:function(a, b){"undefined"==typeof b&&(b="");return"undefined"==typeof a?b:a+""},
        isString:function(a){return"string"==typeof a||"object"==typeof a&&a&&a.constructor==String?!0:!1},
        cboolean:function(a,b){"undefined"==typeof b&&(b=!1);return"undefined"==typeof a?b:!!a},
        isBoolean:function(a){return"boolean"==typeof a||"object"==typeof a&&a&&a.constructor==Boolean?!0:!1},
        cjson:function(a,b){if(!this.isObject(a)&&this.isString(a))if("undefined"!=typeof JSON)try{a=JSON.parse(a)}catch(c){a={error:c.message}}else try{a= eval("("+a+")")}catch(d){a={error:d.message}}return"undefined"!=typeof b&&"object"!=typeof a?b:this.cobject(a)},
        cjquery:function(a,b){"undefined"==typeof b&&(b=jQuery());return"undefined"!=typeof a&&a?jQuery(a):b},
        isJquery:function(a){return"object"==typeof a&&a&&a.jquery?!0:!1},
        cdate:function(a,b){"undefined"==typeof b&&(b=Date());if("undefined"==typeof a)return b;a=Date.parse(a);return isNaN(a)?b:a},
        isDate:function(a){return"object"==typeof a&&a&&a.constructor==Date?!0:!1},
        cdefault:function(a,b){"undefined"== typeof b&&(b=null);return"undefined"==typeof a?b:a},
        isFunction:function(a){return"function"==typeof a||"object"==typeof a&&a&&a.constructor==Function?!0:!1}
    };

(function ($) {


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
        return {"width":container.width, "height":container.height, "container": parent};
    
    parent = ele.parent();
    if ( ! parent.length )
        parent = jQuery(window);
        
    return {"width":parent.width(), "height":parent.height(), "container": parent};
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
                persist    : false
            };
            
        ele = Cast.cjquery(ele);
        settings = Cast.cobject(settings);
        
        for (k in data) {    
            data[k] = (typeof settings[k] != 'undefined')? settings[k] : data[k]; 
        }
        
        container = Elements.getContainer(ele, data);
          
        if ( ! container.container.length ) {
            ele.css({
                "margin-left"    : "auto",
                "margin-right"   : "auto",
                "vertical-align" : "middle"
            });
            return ele;
        }
        
        itop  = Math.round((container.height/2)-(ele.height()/2)) + "px";
        ileft = Math.round((container.width/2)-(ele.width()/2)) + "px";
        pos   = ele.css("position"); 
        
        if ( pos == "absolute" || pos == "fixed" ) {
            ele.css({
                "left" : ileft, 
                "top"  : itop
            });
            if (data.persist && container.container.length && typeof container.container.on == 'function') {
                container.container.on('resize', function(){ 
                    ele.css({
                        "left" : Math.round( (($(this).outerWidth() || $(this).width())/2) - ((ele.outerWidth() || ele.width())/2) ) + "px", 
                        "top"  : Math.round( (($(this).outerHeight() || $(this).height())/2) - ((ele.outerHeight() || ele.height())/2) ) + "px"
                    });
                });
            }
            return ele;
        }

        ele.css({
            "margin-left" : ( (! data.horizontal)? Cast.cint(ele.css("margin-left")): ileft ),
            "margin-top"  : ( (! data.vertical)?   Cast.cint(ele.css("margin-top")): itop )
        });
        if (data.persist && container.container.length && typeof container.container.on == 'function') {
            container.container.on('resize', function(){ 
                ele.css({
                    "margin-left" : Math.round( (($(this).outerWidth() || $(this).width())/2) - ((ele.outerWidth() || ele.width())/2) ) + "px", 
                    "margin-top"  : Math.round( (($(this).outerHeight() || $(this).height())/2) - ((ele.outerHeight() || ele.height())/2) ) + "px"
                });
            });
        }
        
        return ele;
    };
    
/**
 * When image functions are performed, image data is stored on the element
 * In the case of multiple elements, it always returns the data of the first
 * @param {jquery} img - the img jquery element
 * @param {string} [dataSet] - the subset of data to save
 * @param {json} [data] - the data to save
 * @return {json} the image data
 */
Elements.elementData = function(img, set, newData)
    {
        if (typeof set == 'object') { 
            newData = set;
            set = "";
        }
        newData = Cast.cobject(newData); //assumed data is always object data
        
        set = Cast.cstring(set);
        if ( ! set )
            set = "default";
        
        img = Cast.cjquery(img);
        if (img.length > 1)
            img = img.get(0);
        
        if ( img.length ) {     
            var data = Cast.cobject(img.data("Images"));
            data[set] = Cast.cobject(data[set]);
            jQuery.extend(data[set], newData);
            img.data("Images", data);
            return data[set];
        }
        return {};
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
        var imgs = Cast.cjquery(imgs);
        var that = this;
        
        return jQuery.Deferred(function(dfdpl){
            imgs.each(function(index, value){
                that.loadImage(jQuery(value)).done(function(w,h,img){
                    if ( index >= (imgs.length-1) )
                        dfdpl.resolve(img);
                });
            });
            if ( ! imgs.length )
                dfdpl.reject(imgs, "no image elements to preload");
        }).promise();
    };
    
/**
 * Preloads one image element and gets the width and height of the original image
 * @param {jQuery} img - one jQuery img element
 * @return {jqXHR}
 */
Images.loadImage = function(img)
    {   
        var that = this;
        return jQuery.Deferred(function(dfdobj){
            
            //if the size is already calculated, just return that
            var iData = Cast.cobject(Elements.elementData(img));
            if ( ! (Cast.cint(iData.owidth) == 0 || Cast.cint(iData.oheight) == 0) ) {
                dfdobj.resolve(iData.owidth, iData.oheight, img);
                return this;
            }
            
            //make sure image is loaded, then pull original image size
            var theImage = new Image();
            var src = Cast.cstring(img.attr("src"));
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
            if(theImage.complete && dfdobj.state == "pending"){
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

})(jQuery);

/**
 * Image functions
 * From: objects/Elements.js
 * @class Images
 * @version 1.3
 * @requires jQuery1.3+
 * @requires Cast
 * @requires DOMImage
 * @alias Images
 * @classDescription tools that affect html images
 */
var Images = {
    version:1.3,
    /**
     * Sets if image is loaded, defaults to setting loaded = true
     * @deprecated to be removed
     * @param {jQuery|string} img - selector or jquery img element, assumes one element
     * @param {boolean} [b] sets loaded to true or false, default true.
     * @return this object
     */
    setLoaded : function(img, b)
    {
        b = Cast.cboolean(b,true);
        Cast.cjquery(img).data("loaded", b);
        return this;
    },
    /**
     * Determines if image is loaded
     * @deprecated to be removed
     * @param {jQuery|string} img - selector or jquery img element, assumes one element
     * @return {boolean}
     */
    isLoaded : function(img)
    {
        return Cast.cboolean(
            Cast.cjquery(img).data("loaded")
        );
    },
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
    loadImages : function(imgs)
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
    },
    /**
     * Preloads one image element and gets the width and height of the original image
     * @compatible jQuery 1.6+
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
    loadImage : function(img)
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
    },
    /**
     * Resize image to target height.  Uses aspect ratio to determine width.
     * @todo adjust element data to read original-width/original-height at the element root
     * @param {jquery} img - one img element
     * @return {int} the aspect ratio correct width in pixels
     */
    getRatioW : function(img, targetH)
    {
        var iData = Cast.cobject(Elements.elementData(img));
        var rW = Cast.cint(iData['owidth'])/Cast.cint(iData['oheight']);
        if ( isNaN(rW) )
            return 0; 
        return targetH*rW;
    },
    /**
     * Resize image to target width.  Uses aspect ratio to determine height.
     * @todo adjust element data to read original-width/original-height at the element root
     * @param {jquery} img - one img element
     * @return {int} the aspect ratio correct height in pixels
     */
    getRatioH : function(img, targetW)
    {
        var iData = Cast.cobject(Elements.elementData(img));
        var rH = Cast.cint(iData['oheight'])/Cast.cint(iData['owidth']);
        if ( isNaN(rH) )
            return 0;
        return targetW*rH;
    },
    /**
     * Resizes image to new width and aspect ratio height
     * @todo add ability to resize on px, in or percent - will need to size, get new size in px, then apply aspect ratio
     * @param {jquery} img - one img element
     * @param {string/int} w - new width
     * @param {int} effect - speed to animate to new size (0 = instant)
     * @return img object
     */
    resizeW : function(img, targetW, effect)
    {
        return Elements.resize(
            img,
            targetW,
            this.getRatioH(img,targetW),
            effect
        );
    },
    /**
     * Resizes image to new height and aspect ratio width
     * @todo add ability to resize on px, in or percent - will need to size, get new size in px, then apply aspect ratio
     * @param {jquery} img - one img element
     * @param {string/int} h - new height
     * @param {int} effect - speed to animate to new size (0 = instant)
     * @return img object
     */
    resizeH : function(img, targetH, effect)
    {
        return Elements.resize(
            img,
            this.getRatioW(img,targetH),
            targetH,
            effect
        );
    },
    /**
     * size an image inside a container (maintaining aspect ratio)
     * @param {jquery} img the image element to fit
     * @param {jquery/string} container - the jquery or selector of container
     * @param {int} speed - the fade in speed (0 for instant)
     * @param {boolean} unbound - false (default) fit largest side in container, true - fit smallest side to container (overflow happens)
     * @return {Images} this
     */
    fitInParent : function(img, container, speed, unbound)
    {
        container = Elements.getContainer(img, container);
        return this.fitInArea(img, container.width, container.height, speed, unbound);
    },
    /**
     * size an image inside a width and height (maintaining aspect ratio)
     * @param {jquery} img the image element to fit
     * @param {int} w the containing width
     * @param {int} h the containing height
     * @param {int} speed - the fade in speed (0 for instant)
     * @param {boolean} unbound - false (default) fit largest side in container, true - fit smallest side to container (overflow happens)
     * @return {Images} this
     */
    fitInArea : function(img,w,h,speed,unbound)
    {
        unbound = Cast.cboolean(unbound); //false: fit entire image in container, true: fit smallest length to container  
        
        if ( unbound == (Math.abs(img.width()-w) < Math.abs(img.height()-h)) ) //largest side in comparison to container
            return this.resizeW(img,w,speed);
        return this.resizeH(img,h,speed);
    },
    /**
     * resize images based on container
     * @param {jQuery/string} selector - one to many jquery img elements
     * @param {json} [options] - resize options
     * @return {jqXHR} deferred object
     */
    fitImages : function(imgs, options)
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
    },
    /**
     * resize an image based on container
     * @param {jQuery/string} selector - one jquery img element
     * @param {json} [options] - resize options
     * @return {jqXHR} deferred object
     */
    fitImage : function(img, options)
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
    },
    /**
     * Preload/verify image url
     * @param {string} url full image url
     * @return {jqXHR}
     *      done(url, status, jqXHR)
     *      fail(jqXHR, status, errString, url) //mimic ajax
     */
    exists : function(url)
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
    },
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
    svg : function(jqo, svg)
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
    },
    /**
     * Checks for svg support
     * @return {boolean}
     */
    svgSupported : function()
    {
        if (typeof Images.bSvgSupported != "undefined")
            return Images.bSvgSupported;
        var img = document.createElement('img');
        img.setAttribute('src','data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D');
        Images.bSvgSupported = img.complete;
        return Images.bSvgSupported;
    }
};  //functions shared across all images


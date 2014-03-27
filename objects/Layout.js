/**
 * Layout functions - extend Elements Object.
 * <div>
 * Tools adding a helping hand to where css hasn't evolved to or needs some back/cross-browser compatibility
 * Based on Sticky Layout model - suggest using physical size over pixels where possible
 *      max: the largest an element can grow to
 *      min: smallest constraint
 *      absolute:  always one static size
 *      liquid: size to contents
 *      auto:  size to fill container width wise and size to contents height wise
 * </div>
 * <div>
 * From: objects/Layout.js
 * </div>
 * @class Layout
 * @version 1.0
 * @requires jQuery1.6+
 * @requires Cast
 * @requires Elements
 * @classDescription javascript that affects layout.  Css is primarily used, but this fills in the gaps where it fails.
 * @property {function} unit(v,u) - get/convert the unit object (array [value,unit])
 * @property {function} stats(jqo,title) - debug function sending element stats to the console
 * @property {function} unitConvert(a,unit,container) - private function used to convert unit to unit
 * @property {function} innerSpace(jqo) - the space available inside an element.  outputs px.
 * @property {function} getWidth(jqo,css,unit) - the width based on max/min.  outputs px or in
 * @property {function} inlineJustify(jqc,jqo,settings) - justify the width of inline-block elements
 * @property {function} fileTreeJson(files,images) creates a jQuery file tree
 */
if (typeof jQuery != 'undefined') {
    jQuery.fn.stats = function(){
        Elements.stats($(this));
    };
}
/**
 * Returns [#,unit] array of css measurement e.g. 3px, 4%, etc
 * @param {string} v - the css unit (e.g. 5px, 5%, 5in)
 * @param {string} u - the unit type to convert to (e.g. px, in)
 * @return {array} the value and unit [value, unit]
 * 
 */
Elements.unit = function(v, u)
{
    v = Cast.carray(Cast.cstring(v).match(/([\-\.0-9]+)([a-zA-Z%]*)/));
    return Cast.cstring(u) ?
        Elements.unitConvert([
            (Cast.cstring(v[1]))?v[1]:"0",
            (Cast.cstring(v[2]))?v[2]:"px"
        ],u):
        [
            (Cast.cstring(v[1]))?v[1]:"0",
            (Cast.cstring(v[2]))?v[2]:"px"
        ];
};
/**
 * Debug method to get stats on an element, sends info to console.log
 * @param {selector-string|HTMLElement|jQuery} jqo - the element
 * @param {string} [title] caption to headline status
 * @return none
 * 
 */
Elements.stats = function(jqo, title)
{
    jqo   = Cast.cjquery(jqo);
    title = Cast.cstring(title);
    console.log(
        title + "\n"
        + "  outerwidth: "
        + Elements.unit(jqo.outerWidth(true),"px")
        + " - "
        + Elements.unit(jqo.outerWidth(true),"in")
        + "\n"
        + "  width:      "
        + Elements.unit(jqo.width(),"px")
        + " - "
        + Elements.unit(jqo.width(),"in")
        + "\n"
        + "  outerHeight:"
        + Elements.unit(jqo.outerHeight(true),"px")
        + " - "
        + Elements.unit(jqo.outerHeight(true),"in")
        + "\n"
        + "  height:     "
        + Elements.unit(jqo.height(),"px")
        + " - "
        + Elements.unit(jqo.height(),"in")
        + "\n"
    );
};
/**
 * Only works for px to in and in to px right now
 * @private
 * @param {array} a [#,unit]
 * @return [#,unit] array of css measurement e.g. 3px, 4%, etc
 */
Elements.unitConvert = function(a, unit, container)
{
    if (a[1]==unit) {
        return a;
    }
    if (unit =="in") {
        if (a[1]=="px")
            a[0] = Cast.cfloat(a[0]) / Elements.pxToIn;
        else if (a[1]=="em") //this will be complicated, get containers until you find a font set, or post a font and get size
            a[0] = 1*12 / Elements.pxToIn;
        else if (a[1]=="%") //get container's inner space and divide
            a[0] = (Elements.innerSpace(container) / a[0] / Elements.pxToIn);
        a[1] = "in";
    }
    else if (unit=="px") {
        if (a[1]=="in")
            a[0] = Cast.cfloat(a[0]) * Elements.pxToIn;
        else if (a[1]=="em") //get this container's font size
            a[0] = 1*12;
        else if (a[1]=="%") //get this container's innerspace
            a[0] = parseInt(Elements.innerSpace(container) / a[0]);
        a[1] = "px";
    }
    else if (unit=="%") {
        if (a[1]=="in")
            a[0] = (Elements.innerSpace(container) / a[0] / Elements.pxToIn);
        else if (a[1]=="px")
            a[0] = (Elements.innerSpace(container) / a[0]);
        else if (a[1]=="em") //get this container's font size
            a[0] = (Elements.innerSpace(container) / a[0] / 12);
        a[1] = "%";
    }
    else if (unit=="em") {
        a[0] = 1;
        a[1] = "%";
    }
    return a;
};
/**
 * Uses some extended checking to get the innerSpace available in an element.  
 * @param {selector-string|HTMLElement|jQuery} jqo - the target element
 * @return {json} 
 * <pre>{
 *  "width" : {array} [#,unit] array of css measurement e.g. 3px, 4%, 3in
 *  "height" : {array} [#,unit] array of css measurement e.g. 3px, 4%, 3in
 * }</pre>
 */
Elements.innerSpace = function(jqo)
{
    var space = {
        "width":  [0,"px"],
        "height": [0,"px"]
    },
        p = false;
    
    if (typeof jqo == 'undefined')
        jqo = window;
    if (jqo === window || jqo == document)
        p = true;
    
    jqo = Cast.cjquery(jqo);
    if (! jqo.length)
        return space;
    
    if (p) { //document and window don't consider padding, window doesn't consider scrollbars
        space.width[0]  -= Elements.unit($("body").css("padding-left"), "px")[0] + Elements.unit($("body").css("padding-right"),"px")[0];
        space.height[0] -= Elements.unit($("body").css("padding-top"), "px")[0] + Elements.unit($("body").css("padding-bottom"), "px")[0];
    }
    
    space.width[0]  += jqo.width();
    space.height[0] += jqo.height();
    
    return space; //not jQuery.innerWidth because this doesn't consider border
};
/**
 * Find width based on max, min, preset and current size (object must be pre-loaded if css.width is not set)
 * @param {jquery} the element
 * @param {json} css settings {max-width, min-width, width}
 * @param {string} [unit] the unit to use (defaults to px)
 * @return {Element.unit} the calculated size
 */
Elements.getWidth = function(jqo, css, unit)
{
    unit = Cast.cstring(unit, "px");
    css  = Cast.cjson(css);
    return [
        ((Cast.cstring(css.width)) ?
            Elements.unit(css.width, "px")[0] :
            Math.min(
                Math.max(
                    jqo.outerWidth(true), 
                    Elements.unit(css["min-width"],"px")[0]
                ), 
                ((Cast.cstring(css["max-width"])) ?
                    Elements.unit(css["max-width"],"px")[0] :
                    jqo.outerWidth(true)
                )
            )
        ),
        unit
    ];
};
/**
 * Justifies inline-block widths to fill their container - good for galleries
 * @param {selector-string|HTMLElement|jQuery} jqc the container of the inline blocks
 * @param {selector-string|HTMLElement|jQuery} jqo the inline blocks to size
 * @param {json} settings
 * <pre>{
 *  "base" : {Elements.unit} base size, preferred in inches
 *  "offset" : {int} additional pixels around the jqo which jquery doesn't consider... like shadow...
 *  "min"  : {Elements.unit} min size, best set in css - in the future this will activate for old browsers
 *  "max"  : {Elements.unit} max size, best set in css - in the future this will activate for old browsers
 * }</pre>
 */
Elements.inlineJustify = function(jqc, jqo, settings)
{
    jqo = Cast.cjquery(jqo);
    //Elements.stats(jqo, "inlineJustify inline object");
    //Elements.stats(jqc, "inlineJustify container object");
    settings = Cast.cjson(settings);
    Elements.startAfterResizeEvent(window);
    jQuery(window).on("afterresize", {
            "jqow": Elements.getWidth(jqo, settings), 
            "jqc" : Cast.cjquery(jqc), 
            "jqo" : jqo, 
            "jqop": (jqo.outerWidth(true) - jqo.width()) + Cast.cint(settings.offset)
        }, 
        function(e){
            e.data.jqcw = Elements.unit(Elements.innerSpace(e.data.jqc).width,"px");
            var ncol = parseInt(e.data.jqcw[0] / parseInt(e.data.jqcw[0] / e.data.jqow[0]));
            jqo.width(ncol-e.data.jqop);
            //Elements.stats(jqo, "inlineJustify inline object");
            //Elements.stats(jqc, "inlineJustify container object");
    });
    jQuery(window).trigger("afterresize");
};
/**
 * Lists files/folders in a dropdown method based on source json.
 * @param {json} files
 * {<pre>
 *  "name":{string} the file/folder name
 *  "type":{string} e.g. "jpg","/", "."
 *  "contents":{json} next files list
 * </pre>}
 * @param {json} [images] - the images to use, references type property  
 * {<pre>
 *  "/" : {"url"}, //folder image
 *  "." : {"url"}, //hidden image
 *  "*" : {"url"},  //fallback image
 *  "jpg" : {"url"},  //jpg extension image
 *  "text/json" : {"url"},  //mime reference
 * </pre>},
 * @return {jQuery} the file tree HTML
 */
Elements.fileTreeJsonOld = function(path, files, images)
{
    var jqo = jQuery("<ul />"),
        jqot = null,
        jqoc = null,
        fileTreeImage = function(type, images) {
            type = Cast.cstring(type);
            for (var k in images) {
                if (k == type)
                    return images[k];
            }
            return "*" in images ? images["*"] : ""; //default image
        };
    
    for (i in files) {
        var file = files[i];
        //set the title html
        var jqot = jQuery(
              "<div class='title'>"
            + "<img src=\""+fileTreeImage(file["type"],images)+"\" />"
            + " "
            + "<span>" + file["name"] + "</span>"
            + "</div>"
        );
        //set the contents html
        var jqoc = Elements.fileTreeJson(file["contents"], images);
        //append them to the main
        var temp = jQuery("<li />");
        temp.append(jqot)
            .append(jqoc);
        jqo.append(temp);
        //have the title toggle the contents
        Elements.toggle(jqoc, jqot, {
            "t" : true,
            "h" : true,
            "w" : false
        });
    }
    return jqo;
};
/**
 * Lists files/folders in a dropdown method based on source json.
 * @param {string} path - the starting absolute path point
 * @param {json} files
 * {<pre>
 *  "name":{string} the file/folder name
 *  "type":{string} e.g. "jpg","/", "."
 *  "contents":{json} next files list
 * </pre>}
 * @param {json} [images] - the images to use, references type property  
 * {<pre>
 *  "/" : {"url"}, //folder image
 *  "." : {"url"}, //hidden image
 *  "*" : {"url"},  //fallback image
 *  "jpg" : {"url"},  //jpg extension image
 *  "text/json" : {"url"},  //mime reference
 * </pre>},
 * @return {jQuery} the file tree HTML
 * @fires selected
 * @fires toggled
 */
Elements.fileTree = function(path, files, images, useRaw)
{
    var jqo = Elements.fileTree.json(path, files, images);
    useRaw = Cast.cboolean(useRaw, true);
    
    jqo.find(".title").click({"jqo":jqo}, function(e){
        var title  = jQuery(this),                                   //jQuery(e.target), e.target is the smallest denomination of element clicked
            path   = Cast.cstring(title.closest("li").attr("path")), //first li parent
            folder = Cast.cstring(title.attr("target")),             //unused for now
            name   = title.children(".name:first-child").text(),     //first name child
            contents = title.next("ul");                             //next ul
        console.log("e.target: " + jQuery(e.target).attr("class"));
        //console.log("title: " + title.length);
        e.data.jqo.trigger("selected", [title, path]);
        
        if (contents.length && contents.children("li").length) {
            if(contents.is(":visible"))
                contents.hide();
            else
                contents.show();
            
            e.data.jqo.trigger("toggled", [title.find(".toggle"), contents.is(":visible"), contents, path+"/"+folder]);
        }
        
        return true;
    });
    
    //raw defaults to be overridden
    if (useRaw) {
        Elements.fileTree.css(jqo);
        
        jqo.on("selected", function(e, title){
            jQuery(this).find(".title").css({
                "background-color" : "#FFFFFF"
            });
            title.css({
                "background-color" : "#EEEEEE"
            });
        });
        
        jqo.on("toggled", function(e, toggle, state){
            if (state)
                toggle.text("-");
            else
                toggle.text("+");
        });
    }
    
    return jqo;
};
//sample css
Elements.fileTree.css = function(jqo)
{
    jqo.css({
        "display"  : "block",
        "position"  : "relative",
        "margin"   : "0px",
        "padding"  : "0px"
    });
    jqo.find("ul").css({
        "display"  : "block",
        "position"  : "relative",
        "margin"        : "0px",
        "padding"       : "0px 0px 0px 20px"
    });
    jqo.find("li").css({
        "display"  : "block",
        "position"  : "relative",
        "margin"        : "0px",
        "padding"       : "1px",
        "list-style-type" : "none"
    });
    jqo.find(".title").css({
        "margin" : "0px",
        "padding"  : "0px",
        "vertical-align" : "middle"
    });
    jqo.find(".check").css({
        "display"  : "inline-block",
        "position"  : "relative",
        "width"  : "14px",
        "height"  : "14px",
        "margin" : "0px",
        "padding"  : "2px",
        "vertical-align" : "middle"
    });
    jqo.find(".check input").css({
        "width"  : "100%",
        "height"  : "100%",
        "margin" : "0px",
        "padding"  : "0px"
    });
    jqo.find(".toggle").css({
        "display"  : "inline-block",
        "position"  : "relative",
        "width"  : "14px",
        "height"  : "14px",
        "margin" : "0px",
        "padding"  : "2px",
        "text-align" : "center",
        "vertical-align" : "middle"
    });
    jqo.find(".type").css({
        "display"  : "inline-block",
        "position"  : "relative",
        "width"  : "14px",
        "height"  : "14px",
        "margin" : "0px",
        "padding"  : "3px",
        "overflow"  : "hidden",
        "font-size"  : "50%",
        "border"  : "1px solid #E1E1E1",
        "text-align" : "center",
        "vertical-align" : "middle"
    });
    jqo.find(".name").css({
        "display"  : "inline-block",
        "position"  : "relative",
        "margin" : "0px",
        "padding"  : "2px"
    });
};
Elements.fileTree.template = function()
{
    return ""
        + "<div class='title'>"
        + "<span class='check'><input type=\"checkbox\"></span>"
        + "<span class='toggle'>-</span>"
        + "<span class='type'>{{type}}</span>"
        + "<span class='name'>{{name}}</span>"
        + "</div>"
        + "<ul>"
        + "[[contents:"
        + "<li>"
        + "if contents.length call this template again" //self iteration && true/false statements
        + "</li>"
        + "]]"
        + "</ul>";
};
Elements.fileTree.json = function(path, files, images)
{
    var jqo = jQuery("<ul />"),
        jqot = null,
        jqoc = null;
    
    path = Cast.cstring(path);
    
    for (i in files) {
        var file = files[i],
            img  = Elements.fileTree.getImage(file["type"],images);
        //set the title html
        var jqot = jQuery(
              "<div class='title'>"
            + "<span class='check'><input type=\"checkbox\"></span>"
            + "<span class='toggle'>" + (file["contents"].length ? "-":"&nbsp;") + "</span>"
            + "<span class='type'>" + (img ? "<img src=\""+img+"\" />" : file["type"]) + "</span>"
            + "<span class='name'>" + file["name"] + "</span>"
            + "</div>"
        );
        //set the contents html
        var jqoc = Elements.fileTree.json(path+file["name"], file["contents"], images);
        //append them to the main
        var temp = jQuery("<li path=\"" + path + "\" />");
        temp.append(jqot)
            .append(jqoc);
        jqo.append(temp);
    }
    
    return jqo;
};
Elements.fileTree.getImage = function(type, images) {
    type = Cast.cstring(type);
    for (var k in images) {
        if (k == type)
            return images[k];
    }
    return "*" in images ? images["*"] : ""; //default image
};
/**
 * Lists files/folders in a dropdown method based on url list
 * @param {string} url - url to ajax.  returns the below json format
 * {<pre>
 *  "name":{string} the file/folder name
 *  "type":{string} e.g. "jpg","/", "."
 *  "contents":{json} next files list
 * </pre>}
 * @param {string} path - the path to send to the url (adds dir for each sub-dir and loads as needed)
 * @param {json} data - data to send to url
 * @return none
 */
Elements.fileTreeUrl = function(files)
{
    
};

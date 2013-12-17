Elements = (typeof Elements=='object')?Elements:{};

/**
 * Tools to add a little helping hand to where css hasn't evolved to
 */
Elements.pxToIn=Cast.cint($("<div style='display:block;position:relative;width:1in;margin:0px;padding:0px;border:none;' />").width());
/**
 * Returns [#,unit] array of css measurement e.g. 3px, 4%, etc
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
Elements.show = function(jqo)
{
    jqo = Cast.cjquery(jqo);
    console.log(
        "outerwidth:"
        + Elements.unit(jqo.outerWidth(true),"in")
        + " - "
        + Elements.unit(jqo.outerWidth(true),"px")
        + "\n"
        + "width:"
        + Elements.unit(jqo.width(),"in")
        + " - "
        + Elements.unit(jqo.width(),"px")
        + "\n"
        + "outerHeight:"
        + Elements.unit(jqo.outerHeight(true),"in")
        + "\n"
        + "height:"
        + Elements.unit(jqo.height(),"in")
        + "\n"
    );
};
/**
 * @param {array} a [#,unit]
 * Returns [#,unit] array of css measurement e.g. 3px, 4%, etc
 */
Elements.unitConvert = function(a, unit)
{
    if (a[1]==unit) {
        return a;
    }
    if (unit =="in") {
        if (a[1]=="px")
            a[0] = Cast.cfloat(a[0]) / Elements.pxToIn;
        else if (a[1]=="em") //this will be complicated, get containers until you find a font set, or post a font and get size
            return a;
        a[1] = "in";
    }
    else if (unit=="px") {
        console.log("!"+Cast.cfloat(a[0]) + "*" + Elements.pxToIn + "=" + (Cast.cfloat(a[0]) * Elements.pxToIn));
        if (a[1]=="in")
            a[0] = Cast.cfloat(a[0]) * Elements.pxToIn;
        a[1] = "px";
    }
    return a;
};
Elements.innerSpace = function(container)
{
    var space = {
        "width":  [0,"px"],
        "height": [0,"px"]
    },
        p = false;
    
    if (typeof container == 'undefined')
        container = window;
    if (container === window || container == document)
        p = true;
    
    container = Cast.cjquery(container);
    if (! container.length)
        return space;
    
    if (p) { //document and window don't consider padding, window doesn't consider scrollbars
        space.width[0]  -= Elements.unit($("body").css("padding-left"), "px")[0] + Elements.unit($("body").css("padding-right"),"px")[0];
        space.height[0] -= Elements.unit($("body").css("padding-top"), "px")[0] + Elements.unit($("body").css("padding-bottom"), "px")[0];
    }
    
    space.width[0]  += container.width();
    space.height[0] += container.height();
    
    return space; //not jQuery.innerWidth because this doesn't consider border
};
/**
 * Justifies inline-block widths to fill their container
 * @param {jQuery/string} jqc the container of the inline blocks
 * @param {jQuery/string} jqo the inline blocks to size
 * @param {Object} settings
 *  "base" : {Elements.unit} base size, preferred in inches
 *  "offset" : {int} additional pixels around the jqo which jquery doesn't consider... like shadow...
 *  "min"  : {Elements.unit} min size, best set in css - in the future this will activate for old browsers
 *  "max"  : {Elements.unit} max size, best set in css - in the future this will activate for old browsers
 */
Elements.inlineLiquid = function(jqc, jqo, settings)
{
    jqo = Cast.cjquery(jqo);
    Elements.show(jqo);
    settings = Cast.cjson(settings);
    Elements.startAfterResizeEvent(window);
    var auto = [Math.max(jqo.outerWidth(true), Elements.unit(settings["min-width"],"px")[0]),"px"];
    jQuery(window).on("afterresize", {
            "jqow": Cast.cstring(settings.base) ? Elements.unit(settings.base, "px") : auto, 
            "jqc" : Cast.cjquery(jqc), 
            "jqo" : jqo, 
            "jqop": (jqo.outerWidth(true) - jqo.width()) + Cast.cint(settings.offset)
        }, 
        function(e){
            e.data.jqcw = Elements.unit(Elements.innerSpace(e.data.jqc).width,"px");
            var ncol = parseInt(e.data.jqcw[0] / parseInt(e.data.jqcw[0] / e.data.jqow[0]));
            jqo.width(ncol-e.data.jqop);
            //console.log("jqo.width:"+e.data.jqow+" jqc.width:"+e.data.jqcw+" cols:"+ ncol + " - " + (ncol-e.data.jqop) + " pti:"+Elements.pxToIn);
    });
    jQuery(window).trigger("afterresize");
};

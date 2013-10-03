/** ***********************************
 * global.js
 * Should exist across all PL's on all pages
 * All code should have safe wrappers and error fallback to ensure no script failures under any conditions (versions, third-party, browsers)
 * Uses psudo minification for live error pin-pointing
 *************************************** */

/**
 * Safe/Defaults variable casting and type detection
 * from: objects/Cast.js
 * dependancies: javascript 1.0
 */
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

/**
 * Ensure base objects for older browsers (for lightweight sake the functionality isn't recreated, just made not to error)
 * window.console.log/console.log
 * JSON.stringify/JSON.parse
 * jQueryVersion {float}
 */
window.console = console = Cast.cobject(window.console);
window.console.log = console.log =  (Cast.isFunction(window.console.log))? window.console.log: function(){};
var JSON;JSON||(JSON={});
JSON.stringify = (Cast.isFunction(JSON.stringify))?JSON.stringify: function(){return "";};
JSON.parse = Cast.cjson;
var jQueryVersion = 0;
if ( typeof jQuery == 'function' ) {
    jQueryVersion = jQuery.fn.jquery;
    jQueryVersion = jQueryVersion.split(".").slice(0,2).join("."); //only want the first increment e.g. 1.7.55 = 1.7
    jQueryVersion = Cast.cfloat(jQueryVersion,0);
}

/**
 * Parse the URL
 * dependancies: javascript 1.0, w3c DOM 1.0, Cast
 * from: objects/URL.js
 * example: http://somewhere.domain.com:21/hi.html?v=3&c=2#chapter
 */
var URL={
    version   : 1.1,
    href      : Cast.cstring(window.location.href),            //http://somewhere.domain.com:21/hi.html?v=3&c=2#chapter
    host      : Cast.cstring(window.location.hostname),        //somewhere.domain.com
    domain    : "",                                          //domain.com
    hash      : Cast.cstring(window.location.hash),            //#chapter
    port      : Cast.cstring(window.location.port),            //21
    protocol  : Cast.cstring(window.location.protocol),    //http:
    //v=3&c=2
    query     : 1<Cast.cstring(window.location.search).split("?").length?Cast.cstring(window.location.search).split("?")[1]:Cast.cstring(window.location.search),
    
    setValues : function(){return this.setDomain().setPort();},
    setDomain : function(){this.domain=Cast.cstring(window.location.hostname); var a=this.domain.split(".");if(1>a.length){for(var a=window.location.href.split("/"),b=0;b<a.length&&-1==a[b].indexOf(".");b++);a=a[b].split(".")}2<a.length&&a.shift();this.domain=a.join(".");return this;},
    setPort   : function(){this.port=Cast.cstring(this.port);this.port||(this.port="21");return this;},
    getQuery  : function(a){a=Cast.cstring(a);if(!a)return this.query;for(var b=this.query.split("&"),c=0;c<b.length&&b[c].substr(0,b[c].indexOf("="))!=a;c++);return b[c].substr(0,b[c].indexOf("="))!=a?"":b[c].substr(b[c].indexOf("=")+ 1);},
    setQuery  : function(a,b){a=Cast.cjson(a);b=Cast.isString(b)?b:this.query;var c=b.split("&"),e={},d;for(d in c)(k2=Cast.cstring(c[d].split("=")[0]))&&(e[k2]=Cast.cstring(c[d].split("=")[1]));for(d in a)e[d]=Cast.cstring(a[d]);if("function"==typeof jQuery)return jQuery.param(e);c="";for(d in e)c+="&"+d+"="+e[d];return c.replace(/^&/,"");}
};
URL.setValues();


/**
 * Legacy cookie functions
 * dependancies: URL
 */
function setCookie(name, value) {
    document.cookie = name + '=' + value + '; path=/; domain=' + URL.domain;
}
function getCookie(name)  {
    var cookies = document.cookie.toString().split('; ');
    var cookie, c_name, c_value;
    
    for (var n=0; n<cookies.length; n++) {
        cookie  = cookies[n].split('=');
        c_name  = cookie[0];
        c_value = cookie[1];
        
        if ( c_name == name ) {
            return c_value;
        }
    }

    return null;
}


/**
 * Element and Image functions
 * From: objects/Elements.js
 * dependancies:  jQuery 1.6+, Cast, Image
 */
var Elements = {version:3.3};
var Images   = {version:1.1};

if (typeof jQuery=='function') {
    jQuery.fn.fitIn=function(a){return Images.fitImages(this,a)};
    jQuery.fn.preload=function(){return Images.loadImages(this)};
    jQuery.fn.resize=function(a,b,c){return Elements.resize($(this),a,b,c)};
    jQuery.fn.center=function(a){return Elements.center($(this),a)}; 
}
    Elements.getContainer=function(c,a){var b=jQuery();a=Cast.cobject(a);Cast.isString(a.parent)?b=c.parents(a.parent):Cast.isObject(a.parent)?b=Cast.cjquery(a.parent):Cast.cboolean(a.parent)&&(b=c.parent());b.length&&(a.width=b.width(),a.height=b.height());if(Cast.cint(a.width)&&Cast.cint(a.height))return{width:a.width,height:a.height,container:b};b=c.parent();b.length||(b=jQuery(window));return{width:b.width(),height:b.height(),container:b}};
    Elements.checkBox=function(a,d,e,b){a=Cast.cjquery(a);if(!a.length)return jQuery();b=Cast.cboolean(b);a.after("<img />");var c=a.next("img");c.attr("imgOn",d).attr("imgOff",e).attr("src",b?d:e).show();b?a.attr("checked","checked"):a.removeAttr("checked");a.hide();c.click(function(){var a=jQuery(this).prev();a.attr("checked")?a.removeAttr("checked"):a.attr("checked","checked");a.change()});a.change(function(a){a=jQuery(a.target).next("img");a.attr("src",a.attr(jQuery(this).attr("checked")?"imgOn": "imgOff"));return!0});return c};
    Elements.setLink=function(a){a=Cast.cjquery(a);a.css("cursor","pointer");a.click(function(){var b=$(this),a=Cast.cstring(b.attr("href")),b=Cast.cstring(b.attr("target"));a&&(b?window.open(a,b):window.location.href=a)});return this};
    Elements.center=function(a,d){var b,e,f,c={parent:!1,width:0,height:0,vertical:!0,horizontal:!0,persist:!1};a=Cast.cjquery(a);d=Cast.cobject(d);for(b in c)c[b]="undefined"!=typeof d[b]?d[b]:c[b];container=Elements.getContainer(a,c);if(!container.container.length)return a.css({"margin-left":"auto","margin-right":"auto","vertical-align":"middle"}),a;b=Math.round(container.height/2-a.height()/2)+"px";e=Math.round(container.width/2-a.width()/2)+"px";f=a.css("position");if("absolute"==f||"fixed"==f){a.css({left:e, top:b});if(c.persist&&container.container.length&&"function"==typeof container.container.on)container.container.on("resize",function(){a.css({left:Math.round(($(this).outerWidth()||$(this).width())/2-(a.outerWidth()||a.width())/2)+"px",top:Math.round(($(this).outerHeight()||$(this).height())/2-(a.outerHeight()||a.height())/2)+"px"})});return a}a.css({"margin-left":c.horizontal?e:Cast.cint(a.css("margin-left")),"margin-top":c.vertical?b:Cast.cint(a.css("margin-top"))});if(c.persist&&container.container.length&& "function"==typeof container.container.on)container.container.on("resize",function(){a.css({"margin-left":Math.round(($(this).outerWidth()||$(this).width())/2-(a.outerWidth()||a.width())/2)+"px","margin-top":Math.round(($(this).outerHeight()||$(this).height())/2-(a.outerHeight()||a.height())/2)+"px"})});return a};
    Elements.elementData=function(a,b,c){"object"==typeof b&&(c=b,b="");c=Cast.cobject(c);(b=Cast.cstring(b))||(b="default");a=Cast.cjquery(a);1<a.length&&(a=a.get(0));if(a.length){var d=Cast.cobject(a.data("Images"));d[b]=Cast.cobject(d[b]);$.extend(d[b],c);a.data("Images",d);return d[b]}return{}}; 
    Elements.resize=function(a,b,c,d){Cast.isNumber(b)&&(b+="px");Cast.isNumber(c)&&(c+="px");d=Cast.cint(d);return 0<d?a.animate({width:b,height:c},d):a.css({width:b,height:c})};
    Images.setLoaded=function(a,b){b=Cast.cboolean(b,!0);Cast.cjquery(a).data("loaded",b);return this};
    Images.isLoaded=function(a){return Cast.cboolean(Cast.cjquery(a).data("loaded"))};
    Images.loadImages=function(a){a=Cast.cjquery(a);var b=this;return jQuery.Deferred(function(c){a.each(function(d,e){b.loadImage($(e)).done(function(b,e,g){d>=a.length-1&&c.resolve(g)})});a.length||c.reject(a,"no image elements to preload")}).promise()}; 
    Images.loadImage=function(a){var b=this;return jQuery.Deferred(function(c){var d=Cast.cobject(Elements.elementData(a));if(0!=Cast.cint(d.owidth)&&0!=Cast.cint(d.oheight))return c.resolve(d.owidth,d.oheight,a),this;var e=new Image,f=Cast.cstring(a.attr("src"));e.onload=function(){Elements.elementData(a,{owidth:e.width,oheight:e.height});b.setLoaded(a);c.resolve(e.width,e.height,a)};e.onerror=function(b){Elements.elementData(a,{owidth:a.width(),oheight:a.height()});c.reject(a.width(),a.height(),a,"invalid src: "+ f)};e.src=f;e.complete&&"pending"==c.state&&(Elements.elementData(a,{owidth:e.width,oheight:e.height}),b.setLoaded(a),c.resolve(e.width,e.height,a))}).promise()};
    Images.getRatioW=function(a,b){var c=Cast.cobject(Elements.elementData(a)),c=Cast.cint(c.owidth)/Cast.cint(c.oheight);return isNaN(c)?0:b*c};
    Images.getRatioH=function(a,b){var c=Cast.cobject(Elements.elementData(a)),c=Cast.cint(c.oheight)/Cast.cint(c.owidth);return isNaN(c)?0:b*c}; 
    Images.resizeW=function(a,b,c){return Elements.resize(a,b,this.getRatioH(a,b),c)};
    Images.resizeH=function(a,b,c){return Elements.resize(a,this.getRatioW(a,b),b,c)};
    Images.fitInParent=function(b,a,c,d){a=Elements.getContainer(b,a);return this.fitInArea(b,a.width,a.height,c,d)};
    Images.fitInArea=function(a,b,c,d,e){e=Cast.cboolean(e);return e==Math.abs(a.width()-b)<Math.abs(a.height()-c)?this.resizeW(a,b,d):this.resizeH(a,c,d)};
    Images.fitImages=function(a,b){a=Cast.cjquery(a);var c=this;return jQuery.Deferred(function(d){a.each(function(e,f){c.fitImage($(f),b).done(function(b,c,f){e>=a.length-1&&d.resolve(f)})});a.length||d.reject(a)}).promise()}; 
    Images.fitImage=function(c,d){var e=this;return this.loadImage(c).done(function(a,c,b){data={parent:!1,width:0,height:0,speed:0,bound:!0};jQuery.extend(data,Cast.cobject(d));Elements.elementData(b,"container",data);a=Elements.getContainer(b,data);e.fitInArea(b,a.width,a.height,data.speed,!data.bound)})};
    Images.exists=function(b){return jQuery.Deferred(function(a){"undefined"!=typeof b&&b||a.reject(a,"fail","blank url","");jQuery("<img src='"+b+"' />").load(function(){a.resolve(b,"success",a)}).error(function(){a.reject(a,"fail","error loading image",b)})}).promise()};


/**
 * User location functions
 * dependancies:  jQuery 1.6+, Cast, URL, Images
 */
var Location={
    version         : 1.1,
    urlLocations    : "http://www."+URL.domain+"/load_locations",
    urlUserLocation : "http://www."+URL.domain+"/ext_api/detect_location.php",
    
    getList         : function(a,b,c){a=Cast.cstring(a);b=Cast.cstring(b);c=Cast.cstring(c);a||(a="country");return jQuery.get(this.urlLocations+("?type="+a+"&code="+b+(c?"&char2="+c:"")))},
    getCountries    : function(a){a=Cast.cstring(a);return this.getList("country_code","",a)},
    getStates       : function(a,b){a=Cast.cstring(a)?a:"US";b=Cast.cstring(b);return this.getList("state_code", a,b)},
    getCities       : function(a){a=Cast.cstring(a);return this.getList("city_id",a)},
    
    getLocation     : function(){return jQuery.Deferred(function(a){jQuery.ajax({url:Location.urlUserLocation,type:"GET",crossDomain:!0,async:!1,contentType:"application/json",jsonpCallback:"jsonDetectLocation",dataType:"jsonp",data:{CALLBACK:"t"},success:function(b,c,d){"object"!=typeof b&&a.reject(d,"failed","invalid location data",b);a.resolve(b,"success",d)},error:function(b,c,d){a.reject(b,c,d,{})}})}).promise()},
    getImage        : function(a){(a= Cast.cstring(a))||(a="1280x720");return $.Deferred(function(b){Location.getLocation().done(function(c,d,f){var e="http://pod."+URL.domain+"/geo/"+a+"/";Images.exists(e+c.sel_locCity+".jpg").done(function(a){b.resolve(a,"city",c)}).fail(function(a,d,f){Images.exists(e+c.sel_locState+".jpg").done(function(a){b.resolve(a,"state",c)}).fail(function(a,d,f){Images.exists(e+c.sel_locCountry+".jpg").done(function(a){b.resolve(a,"country",c)}).fail(function(a,d,e){b.reject(b,"failed","image from detect location could not be resolved", c)})})})})}).promise()},
    imageTest       : function(){Location.getImage().done(function(a,b){console.log("location image loaded("+b+"): "+a)}).fail(function(a,b,c){console.log("location image error: "+c)});return this}
};


/*  SWFObject v2.2 <http://code.google.com/p/swfobject/> 
    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();
    return{
        registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},
        getObjectById:function(X){if(M.w3){return z(X)}},
        embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},
        switchOffAutoHideShow:function(){m=false},ua:M,
        getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},
        hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},
        showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},
        removeSWF:function(X){if(M.w3){y(X)}},
        createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},
        addDomLoadEvent:K,
        addLoadEvent:s,
        getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},
        expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}
    }();

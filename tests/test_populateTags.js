var Cast={
    v:3.7,
    cint:function(b,c){"undefined"==typeof c&&(c=0);if("undefined"==typeof b)return c;b=parseInt(b,10);return isNaN(b)?c:b},
    cfloat:function(b,c){"undefined"==typeof c&&(c=0);if("undefined"==typeof b)return c;b=parseFloat(b,10);return isNaN(b)?c:b},
    isNumber:function(b){return"number"==typeof b||"object"==typeof b&&b&&b.constructor==Number?!0:!1},
    cobject:function(b,c){"undefined"==typeof c&&(c={});return"object"==typeof b&&b?b:c},
    isObject:function(b){return"object"==typeof b&&b?!0:!1},
    carray:function(b,c){"undefined"==typeof c&&(c=[]);if("undefined"==typeof b||!b)return c;if(this.isArray(b))return b;if("function"==typeof b.toArray)return b.toArray();if("object"==typeof b.toArray){c=[];for(var d in b)b.hasOwnProperty(d)&&c.push(b[d]);return c}return[b]},
    isArray:function(b){return"array"==typeof b||"object"==typeof b&&b&&b.constructor==Array?!0:!1},
    cstring:function(b,c){"undefined"==typeof c&&(c="");return"undefined"==typeof b?c:b+""},
    isString:function(b){return"string"==typeof b||"object"==typeof b&&b&&b.constructor==String?!0:!1},
    cboolean:function(b,c){"undefined"==typeof c&&(c=!1);return"undefined"==typeof b?c:!!b},
    isBoolean:function(b){return"boolean"==typeof b||"object"==typeof b&&b&&b.constructor==Boolean?!0:!1},
    cjson:function(b,c){if(!this.isObject(b)&&this.isString(b))if("undefined"!=typeof JSON)try{b=JSON.parse(b)}catch(d){b={error:d.message}}else try{b=eval("("+b+")")}catch(e){b={error:e.message}}return"undefined"!=typeof c&&"object"!=typeof b?c:this.cobject(b)},
    csjson:function(b,c){if(this.isObject(b))if("undefined"!=typeof JSON)try{b=JSON.stringify(b)}catch(d){b={error:d.message}}else{a=[];for(i in b)obj.hasOwnProperty(prop)&&(this.isObject(i[b])?a.push('"'+this.cstring(b)+'":'+this.csjson(i[b])+""):a.push('"'+this.cstring(b)+'":"'+this.cstring(i[b])+'"'));return"{"+a.join()+"}"}return"undefined"!=typeof c?c:this.cstring(b)},
    cjquery:function(b,c){"undefined"==typeof c&&(c=jQuery());return"undefined"!=typeof b&&b?jQuery(b):c},
    isJquery:function(b){return"object"==typeof b&&b&&b.jquery?!0:!1},
    cdate:function(b,c){"undefined"==typeof c&&(c=Date());if("undefined"==typeof b)return c;b=Date.parse(b);return isNaN(b)?c:b},
    isDate:function(b){return"object"==typeof b&&b&&b.constructor==Date?!0:!1},
    cdefault:function(b,c){"undefined"==typeof c&&(c=null);return"undefined"==typeof b?c:b},
    isFunction:function(b){return"function"==typeof b||"object"==typeof b&&b&&b.constructor==Function?!0:!1},
    isRecursive:function(b){return Cast.isArray(b)||Cast.isFunction(b)||"object"==typeof b&&b.constructor==Object||b.constructor==Array||b.constructor==Function?!0:!1},
    ctree:function(b,c,d){c="undefined"==typeof c?null:c;d=Cast.carray(d,[]);if(3<arguments.length)for(var e=2;e<arguments.length;e++)d.push(arguments[e]);return d.length&&"object"==typeof b&&d[0]in b?(e=d.shift(),d.length?this.ctree.call(this,b[e],c,d):b[e]):c},
    cjqxhr:function(b,c){if("object"==typeof b||"function"==typeof b){if("done"in b&&"fail"in b&&"always"in b)return b;if("success"in b&&"error"in b&&"complete"in b)return b.done=b.success,b.fail=b.error,b.always=b.complete,b}c=Cast.cstring(c);if("undefined"!=typeof jQuery&&"Deferred"in jQuery){var d=new jQuery.Deferred;b?d.resolve(c,"success",d):d.reject(d,"error",c);return d.promise()}return b?{message:c,done:function(b){b(this.message,"success",this)},fail:function(b){},always:function(b){b(this,"success",this.message)}}:{message:c,done:function(b){},fail:function(c){c(b,"error",this.message)},always:function(c){c(b,"error",this.message)}}}
};
var Elements = {};
Elements.getRootTags = function(html,tag,max)
{
    var findStart = function(html,a,start)
        {
            for(var i=start;i<a.length && html.charAt(a[i]+1)==='/';i++);return i;
        },
        findTags = function(html,tag)
        {//re = RegExp('<[/]?'+tag+'(.*)[>]','g'), RegExp('<[/]?'+tag+'[ >]','g')RegExp('<[/]?'+tag+'(>|[ ](.+)>)','g')
            var re = RegExp('</?'+tag+'(>| [^>]*)','g'), 
                a = [], 
                k = 0;
            while ((i=html.substr(k).search(re))!==-1) { 
                k=k+i;
                a.push(k++);
            }
            return a;
        },
        getAttributes = function(tag)
        {
            var j=1, 
                tags = {},
                tmp  = tag
                        .replace(/ +(?= )/g,'')
                        .split(" ");
            for(; j<tmp.length; j++) {
                tmp[j] = tmp[j].split("=");
                if (tmp[j].length && tmp[j][0]) 
                    tags[tmp[j][0]] = ((tmp[j][1] || "")+"").replace(/^['"]|['"]$/g, '');
            }
            return tags;
        },
        a     = findTags(html,tag),
        start = findStart(html,a,0),
        tags  = [];
    max = Cast.cint(max,1000);
    
    for(var i=0, j=start;j<max && j<a.length;j++){
        if (html.charAt(a[j]+1)==='/') i--;
        else i++;
        if (i===0 && a[start] !== a[j]) {
            k = html.indexOf(">", a[start]);
            if (k<a[j])
                tags.push({
                    "pos"  : [a[start], html.indexOf(">", a[j])],
                    "attr" : getAttributes(html.substring(a[start],k)),
                    "tag"  : html.substring(a[start],k+1),
                    "html" : k<a[j] ? html.substring(k+1,a[j]) : ""
                });
//document.write(k + " " + tags.length + " " + typeof tags[tags.length-1] + "<BR>");
            j = start = findStart(html,a,j); 
            i=1;
        }
    }
    
    return tags;
};
Elements.populateTag = function(template, struct, tag, regex) 
{
    var j, tags, key, value, rex, i, s;
    tag  = typeof tag == 'undefined' ? "tpl" : tag;
    tags = Elements.getRootTags(template, tag); //jquery was too slow and not accurate
    tags.html = template;
    tags.replace = function(i, s) {
        this.html = this.html.substr(0,this[i].pos[0]) + s + this.html.substr(this[i].pos[1]);
    };
    
    for (j=0;j<tags.length;j++) {
        key   = Cast.ctree(tags[j].attr,"","key");
        value = Cast.ctree(struct,null,key) || struct;
        rex   = Cast.ctree(tags[j].attr,"","rex");
        
        if (rex && value && ! RegExp(rex).test(value)) {
            tags.html = "";
            continue;
        }
        
        if (Cast.cboolean(Cast.ctree(tags[j].attr,"","loop"))
            && typeof value == 'object' || typeof value == 'function' || typeof value == 'array' 
        ) {
            s = "";
            for (i in value) {
                value[i]['$0'] = i;
                s += Elements.populate(tags[j].html, value[i], regex);
            }
            tags.replace(j,s);
            if (i)
                continue;
        }
        
        tags.replace(j,
            Elements.populate(tags[j].html, value, regex)
        );
    }
    
    return tags.html;
};
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
var dhtml = function(s)
{
    return s.replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
var showTags = function(s,html,tags)
{
    document.write("matches " + s + " " + tags.length + " ("+dhtml(html)+")<br>");
    for(var i=0;i<tags.length;i++){
        document.write("tag"+i+": " + '' + " ["+dhtml(JSON.stringify(tags[i]))+"]<br>");
    }
};
var htmla = "</tpl>hfdun <tpla /> la do<tpl </tpl da <tpl /> doo </tpl> <tpl> f</tpl> da</tpl><tpl a></tpl><tpl    ></tpl >";
a = Elements.getRootTags(htmla, 'tpl');
var htmlb = "<tpl>hfdun </tpl /> la do<tpl> </tpl> da <tpl /> doo </tpl> <tpl> f</tpl> da</tpl><tpl a></tpl><tpl key=\"hello\" ></tpl ><tpl key=\"hello\" loop='1' regex='[*]'></tpl >";
  var start = (new Date()).getMilliseconds();  // log start timestamp
b = Elements.getRootTags(htmlb, 'tpl');
  var end =  (new Date()).getMilliseconds();  // log end timestamp
  var diff1 = end - start;

  var start = (new Date()).getMilliseconds();  // log start timestamp
template = jQuery("<div>" + htmlb + "</div>");
jQuery.expr[':'].parents = function(a,i,m){
    return jQuery(a).parents(m[3]).length < 1;
};
var tags = template.find('tpl').filter(':parents(tpl)');
  var end =  (new Date()).getMilliseconds();  // log end timestamp
  var diff2 = end - start;


document.write(diff1 + " vs " + diff2 + "<br>");
showTags('a',htmla,a);
showTags('b',htmlb,b);

document.write( 
    Elements.populateTag(htmlb,{})
    + "<br>"
);
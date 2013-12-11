Graph = function(settings)
{
    return;
};

Graph.graph = function(target, gdata, role, database, sql, template)
{
    var graph = {};
    graph.json     = Cast.cjson(gdata);
    graph.role     = Cast.cstring(role);
    graph.database = Cast.cstring(database);
    graph.sql      = Cast.cjson(sql);
    graph.template = Cast.cstring(template);
    graph.populateSegment = function(jqo, sql)
    {
        InstaClick.doSql(graph.role, graph.database, sql).done(function(data){
            jqo.html("<span style='float:right;cursor:pointer;'><a title='"+sql+"' onclick='alert(\""+sql+"\");'>@</a></span>");
            if ($.isEmptyObject(data)) {
                jqo.append("No Users Found");
                return;
            }
            for (var i in data) {
                jqo.append(
                    Elements.popTemplateString(graph.template, data[i], graph.data)
                );
            }
        }).fail(function(data){
            jqo.html("Failed to load. <span style='float:right;cursor:pointer;'><a title='"+sql+"' onclick='alert(\""+sql+"\");'>@</a></span>");
        });
    };
    
    graph.html = "<table>";
    graph.html += "<tr><th></th>";
    for(var i in graph.json["x-axis"]) {
        graph.html += "<th>";
        graph.html += graph.json["x-axis"][i]["title"];
        graph.html += "</th>";
    }
    graph.html += "</tr>";
    for(var j in graph.json["y-axis"]) {
        gy = graph.json["y-axis"][j];
        graph.html += "<tr>";
        graph.html += "<th>";
        graph.html += gy["title"];
        graph.html += "</th>";
        for(var i in graph.json["x-axis"]) {
            gx = graph.json["x-axis"][i];
            where = graph.sql["where"] + ((gx["conditions"])?" AND " + gx["conditions"]:"") + ((gy["conditions"])?" AND " + gy["conditions"]:"");
            graph.html += "<td class='sql-list'>";
            graph.html += "SELECT "
                            + graph.sql["select"].join(",")
                         + " FROM "
                            + graph.sql["from"]
                         + " WHERE "
                            + where
                         + ((graph.sql["order"].length)?
                           " ORDER BY "
                            + graph.sql["order"].join(" ")
                            : "")
                         + " LIMIT "
                            + graph.sql["limit"]
                         + ";";
            graph.html += "</td>";
        }
        graph.html += "</tr>";
    }
    graph.html += "</tr>";
    graph.html += "</table>";

    $(document).ready(function(){
        $(target).html(graph.html);
        
        $(target + " .sql-list").each(function(index, value){
            jqo = $(value);
            sql = jqo.html();
            jqo.html("Loading... <span style='float:right;cursor:pointer;'><a title='"+sql+"' onclick='alert(\""+sql+"\");'>@</a></span>");
            graph.populateSegment(jqo, sql);
        });
        
    });
    
}; //.graph
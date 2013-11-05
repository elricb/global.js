/**
 * User location functions
 * dependancies:  jQuery 1.6+, Cast, URL, Images
 */
var Location = {
     version: 1.2,
    "urlLocations":    "http://www1."+ URL.domain +"/load_locations",
    "urlUserLocation": "http://www1."+ URL.domain +"/ext_api/detect_location.php",

    /**
     * Gets a list of locations based on type
     * Format: [[code,country],[code,country],...];
     * @param {string} type - city, state or country
     * @param {string} code
     * @return {jqXHR}
     */
    getList: function(type, code, char2)
    {
        type  = Cast.cstring(type);
        code  = Cast.cstring(code);
        char2 = Cast.cstring(char2);
        if ( ! type )
            type = "country";
            
        var selector = "?type=" + type + "&code=" + code + ((char2)?"&char2="+char2:"");
        
        return Cast.cjson(jQuery.get(this.urlLocations + selector));
    },
    getCountries: function(code) {
        code = Cast.cstring(code); //blank = country codes, value = old country codes
        return this.getList('country_code', "", code);
    },
    getStates: function(country, code) {
        country = (! Cast.cstring(country))?"US":country;
        code = Cast.cstring(code); //blank = &&## (iso3166 state), value = && (state code)
        return this.getList('state_code', country, code);
    },
    getCities: function(state) {
        state = Cast.cstring(state); //iso3166 state code &&##
        return this.getList('city_id', state);
    },
    /**
     * Gets user location data
     * format:  {"sel_locCountry":"CA","sel_locState":"CA08","sel_locCity":6161888,"latitude":"60","longitude":"-95"}
     * @param {string} the fallback image upon failure
     * @return {jqXHR}
     *      done(data, textStatus, jqXHR)
     *      fail(jqXHR, textStatus, errorThrown, data)
     */
    getLocation: function()
    {
        return jQuery.Deferred(function(odf){
            jQuery.ajax({
                url:Location.urlUserLocation,
                type: 'GET',
                crossDomain: true,
                async: false,
                contentType: "application/json",
                jsonpCallback: 'jsonDetectLocation',
                dataType: 'jsonp',
                data: {"CALLBACK": "t"},
                success:function(data, textStatus, jqXHR){
                    if (typeof data != 'object')
                        odf.reject(jqXHR, "failed", "invalid location data", data);
                    odf.resolve(data, "success", jqXHR);
                },
                error:function(jqxhr, status, err){
                    odf.reject(jqxhr, status, err, {});
                }
            });
        }).promise();
    },
    /**
     * Gets/Tests background image from detect_location.php
     * format: http://pod.[PL]/geo/1280x720/6161888.jpg
     * @param {string} the fallback image upon failure
     * @return {jqXHR}
     *      done(imageUrlString, area, data)
     *      fail(jqXHR, status, errString, data) //mimic ajax format
     */
    getImage: function(resolution) {
        resolution = Cast.cstring(resolution);
        if(! resolution)
            resolution = "1280x720";
        
        return $.Deferred(function(odf){
            Location.getLocation().done(function(data, textStatus, jqXHR){
                var urlImageBase = 'http://pod.' + URL.domain + '/geo/' + resolution + '/';
                
                Images.exists(urlImageBase + data.sel_locCity + '.jpg')
                    .done(function(urlImage) {
                        odf.resolve(urlImage, "city", data);
                    })
                    .fail(function(jqXHR, status, err) {
                        Images.exists(urlImageBase + data.sel_locState + '.jpg')
                            .done(function(urlImage) {
                                odf.resolve(urlImage, "state", data);
                            })
                            .fail(function(jqXHR, status, err) {
                                Images.exists(urlImageBase + data.sel_locCountry + '.jpg')
                                    .done(function(urlImage) {
                                        odf.resolve(urlImage, "country", data);
                                    })
                                    .fail(function(jqXHR, status, err) {
                                        odf.reject(odf, "failed", "image from detect location could not be resolved", data);
                                    });
                            });
                    });                
            });
        }).promise();
    },
    /**
     * Test this feature
     */
    imageTest: function() {
        Location.getImage().done(function(image, area) {
            console.log("location image loaded("+area+"): " + image);
        }).fail(function(xhr,stat,err) {
            console.log("location image error: " + err);
        });
        return this;
    }
};

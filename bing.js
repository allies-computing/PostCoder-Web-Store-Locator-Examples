var bing_map;
var pin_layer;
var infobox_layer;
var map_locations = [];
var markers_data = [];

// No function to load the bing dependencies as per Google or MapBox, this has to be added to the page HTML instead.

function map_init(api_key, centre_lat, centre_long, default_zoom, callback) {
    
    // initial set up of map and binding to the #mapContainer element 
    bing_map = new Microsoft.Maps.Map(document.getElementById("mapContainer"), {credentials: api_key});
    bing_map.setView({ zoom: default_zoom, center: new Microsoft.Maps.Location(centre_lat, centre_long), mapTypeId : Microsoft.Maps.MapTypeId.road });
    
    // Create a layer for the markers (pins) and add to the map
    pin_layer = new Microsoft.Maps.EntityCollection();
    bing_map.entities.push(pin_layer);
    
    // Another layer for the boxes that show when clicking a marker (pin)
    infobox_layer = new Microsoft.Maps.EntityCollection();
    bing_map.entities.push(infobox_layer);
    
    // Run our callback function, mainly just the show all map markers on page load function
    if (typeof callback === "function") {
        callback();
    }
    
}

function add_markers_to_map(markers) {
    
    // Empty out the pin layer and our global arrays
    pin_layer.clear();
    map_locations = [];
    markers_data = [];
    
    // Loop through pins
    $.each(markers, function(index, value) {
        
        // Add to our array
        markers_data.push(value);
        
        // Create a location object for the lat/long values
        bing_location = new Object();
        bing_location.latitude = parseFloat(value.latitude);
        bing_location.longitude = parseFloat(value.longitude);
        
        // Push the lcoation to the map array
        map_locations.push(bing_location);
        
        // Setup the text and options for the pin, then add to the map
        var pushpinOptions = {text: String(index + 1)}; 
        var pushpin = new Microsoft.Maps.Pushpin(bing_location, pushpinOptions);
        var pushpinClick = Microsoft.Maps.Events.addHandler(pushpin, "click", function(e) { click_result(index) });  
        pin_layer.push(pushpin);
        
    });
    
    // Reset the zoom and pan of the map based on the pins now on the map
    bing_map.setView({ 
        bounds: Microsoft.Maps.LocationRect.fromLocations(map_locations)
    });
    
    // Empty/close any open infoboxes
    infobox_layer.clear();
    
}

function open_marker(marker_id) {
   
    // Grab the pin from our array
    value = markers_data[marker_id];
    
    // Create a location object for the lat/long values
    bing_location = new Object();
    bing_location.latitude = parseFloat(value.latitude);
    bing_location.longitude = parseFloat(value.longitude);
    
    // Empty/close any open infoboxes
    infobox_layer.clear();
    
    // Define our new infobox and and text that will appear, then add to the map (will appear open)
    var infobox_options = {title:value.name, description:value.description}; 
    var infobox = new Microsoft.Maps.Infobox(bing_location, infobox_options);
    infobox_layer.push(infobox);
    
    // Centre the map on the pin that's in use
    bing_map.setView({ 
        center: bing_location
    });
    
}

function add_source_to_map(source) {
    
    // Create a location object for the lat/long values
    bing_location = new Object();
    bing_location.latitude = parseFloat(source.latitude);
    bing_location.longitude = parseFloat(source.longitude);
    
    // Add source to our array of pins
    map_locations.push(bing_location);

    // Create a different pin than search results for our source, and add to the map
    var pushpinOptions = {text: "•"}; 
    var pushpin = new Microsoft.Maps.Pushpin(bing_location, pushpinOptions);
    pin_layer.push(pushpin);
    
    // Reset the zoom and pan of the map based on the pins (including the source pin) now on the map
    bing_map.setView({ 
        bounds: Microsoft.Maps.LocationRect.fromLocations(map_locations)
    });
    
}
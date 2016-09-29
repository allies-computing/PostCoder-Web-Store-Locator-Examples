var mapbox_map;
var marker_layer;

function map_init(api_key, centre_lat, centre_long, default_zoom, callback) {
    
    // load the mapbox css
    $("head").append( $("<link href='https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.css' rel='stylesheet' />"));
    
    // load the mapbox script
    $.getScript("https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.js", function( data, textStatus, jqxhr ) {
        
        // start the mapbox api
        L.mapbox.accessToken = api_key;

        // set up the initial map view
        mapbox_map = L.mapbox.map("mapContainer", "mapbox.streets").setView([centre_lat, centre_long], default_zoom);
    
        // Run our callback function, mainly just the show all map markers on page load function
        if (typeof callback === "function") {

            callback();

        }
        
    });
    
}

function add_markers_to_map(markers) {
    
    // check to see if marker_layer exists, delete if it does
    if(typeof marker_layer !== "undefined") { mapbox_map.removeLayer(marker_layer) };
    
    // set up the geoJSON object
    var markers_geojson = new Object();
    markers_geojson.type = "FeatureCollection";
    markers_geojson.features = new Array();
    
    // loop through markers
    $.each(markers, function(index, value) {
        
        // create geo json feature for each marker
        new_feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [ value.longitude, value.latitude ]
            },
            properties: {
                title: value.name,
                description: value.description,
                "marker-size": "large",
                "marker-color": "#428BCA",
                "marker-symbol": index + 1,
                id: index
            }
        };
        // add feature to geoJSON
        markers_geojson.features.push(new_feature);
        
    });

    // add geoJSON to the map as featureLayer
    marker_layer = L.mapbox.featureLayer(markers_geojson).addTo(mapbox_map);
    
    // repan and zoom the map to fit results
    mapbox_map.fitBounds(marker_layer.getBounds());
    
    marker_layer.on("click", function (e) {
        click_result(e.layer.feature.properties.id);
    });
    
}

function open_marker(marker_id) {
    
    marker_layer.eachLayer(function(feature){
        if(feature.feature.properties.id == marker_id){
            feature.openPopup();
        }
    });
    
}

function add_source_to_map(source) {
    
    // Create marker, with different style to search results, add it to the main marker layer
    L.marker(
        [source.latitude, source.longitude],
        {
            icon: L.mapbox.marker.icon({
                "marker-size": "large",
                "marker-symbol": "circle",
                "marker-color": "#F7931E"
            }),
            clickable: false
        }
    ).addTo(marker_layer);
    
    // repan and zoom the map to fit results
    mapbox_map.fitBounds(marker_layer.getBounds());
    
}
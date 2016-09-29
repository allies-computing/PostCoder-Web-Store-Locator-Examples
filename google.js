var google_map;
var infowindow;
var all_markers = [];
var markers_data = [];

function map_init(api_key, centre_lat, centre_long, default_zoom, callback) {
    
    // Load the google script
    $.getScript("https://maps.googleapis.com/maps/api/js?async=2&key=" + api_key, function( data, textStatus, jqxhr ) {
        
        // Set up the initial map view
        google_map = new google.maps.Map(document.getElementById("mapContainer"), {
          center: { lat: centre_lat, lng: centre_long }, zoom: default_zoom
        });
        
        // Run our callback function, mainly just the show all map markers on page load function
        if (typeof callback === "function") {
            callback();
        }
        
    });
    
}

function add_markers_to_map(markers) {

    // Close any open info windows
    if(infowindow) { infowindow.close(); }
    
    // Clear out existing markers if there are any
    if (all_markers.length > 0) {
        for (var i = 0; i < all_markers.length; i++) {
            all_markers[i].setMap(null);
        }
        all_markers = [];
    }
    
    // Empty our array of markers too
    markers_data = [];
    
    // Loop through markers
    $.each(markers, function(index, value) {
        
        // Create marker and add to google_map
        var marker = new google.maps.Marker({
           
            position: { lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) },
            label: String(index + 1),
            map: google_map
            
        });
        
        // When a marker is clicked also run the function to highlight the item in the list
        marker.addListener("click", function(event) {

            click_result(index);
            
        }); 
        
        // Add the marker to our arrays
        all_markers.push(marker);
        markers_data.push(value);
        
    });
    
    // Measure the bounds of the markers on the map
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < all_markers.length; i++) {
        bounds.extend(all_markers[i].getPosition());
    }
    
    // Set the pan and zoom of the map based on the current markers
    google_map.fitBounds(bounds);
    
}

function open_marker(marker_id) {
    
    // Close any open info windows
    if(infowindow) { infowindow.close(); }
    
    // Grab the pin from our array
    value = markers_data[marker_id];

    // Create a new info window object
    infowindow = new google.maps.InfoWindow();

    // Set up the content of the info window
    var myHTML = "<strong>" + value.name + "</strong><br>" + value.description;
    infowindow.setContent("<div style='width:150px; text-align: center;'>"+myHTML+"</div>");
    
    // Define the position and offset of the info window, then add to the map
    infowindow.setPosition({ lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) });
    infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
    infowindow.open(google_map);
    
}

function add_source_to_map(source) {
        
    // create marker and add to google_map
    var marker = new google.maps.Marker({

        position: { lat: parseFloat(source.latitude), lng: parseFloat(source.longitude) },
        label: "•",
        map: google_map

    });

    // Add source to our array of markers
    all_markers.push(marker);
    
    // Measure the bounds of the markers on the map
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < all_markers.length; i++) {
        bounds.extend(all_markers[i].getPosition());
    }

    // Set the pan and zoom of the map based on the current markers
    google_map.fitBounds(bounds);
    
}
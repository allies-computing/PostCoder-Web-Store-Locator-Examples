// Run the search function on button click
$("#searchButton").on("click", function(e) {
    
    e.preventDefault();
    
    perform_search();
    
});

// Run the search function on press of return in search field
$("#searchInput").keypress(function(e) {
    
    if (e.which == 13) {
    
        perform_search();
        
        return false;
    }
});

// Show all function to add all places in a list to the map, most likely on page load (via callback in map_init())
function show_all() {
    
    // Note: The /placelist/ endpoint is free as it doesn't do any distance calculations
    // We also only advise using it for lists that are less than 100 items as a map becomes less useful after that
    // You can page via ?page=1 etc to show more than 100 find out more at:-
    // https://developers.alliescomputing.com/postcoder-web-api/store-locator/more-endpoints#show-all-places-for-list
    
    // Get all items on list without distances
    var nearest_all_url = "https://ws.postcoder.com/pcw/"+postcoder_api_key+"/nearest/placelist/"+list_id+"/";
    
    // Fetch the list data as JSON
    $.getJSON(nearest_all_url, function (data) {

        // Pass data to the mapping function to add them to the map
        add_markers_to_map(data);

        // Get rid of any placeholder text or existing results in the results list
        $("#searchResults").empty();

        $("#searchResultsIntro").addClass("hidden");

        // Loop through data and add elements to results list
        for (i = 0; i < data.length; i++) {

            // Create the LI and basic contents
            $("#searchResults").append("<li id='marker_"+i+"'><h4><a href='"+data[i].url+"' data-marker-id='"+i+"'>"+data[i].name+"</a></h4></li>");

            // Add additional info (hidden until click) to the LI
            $("#marker_"+i).append("<p class='hidden'>"+data[i].description+"</p>");
            
            // More fields could be added in this way, such as postal_address, url, opening_hours
            // $("#marker_"+i).append("<p class='hidden'>"+data[i].postal_address+"</p>");

        }

        // Add a click handler to all the A tags within the list
        $("#searchResults li h4 a").on("click", function(e) {
           e.preventDefault(); 

            // Find out which marker was clicked
            var marker_id = $(this).attr("data-marker-id");

            // Pass the marker_id to the click_result function
            click_result(marker_id);
            
        });

    }).error(function() { 
                    
        $("#searchLoader").addClass("hidden");
        alert("An error has occurred"); 

    });
}

function perform_search() { 
    
    if (typeof distance_type == "undefined") { distance_type = "" }
    
    if (distance_type == "driving_duration") {
        
        nearest_endpoint = "NearestDriveTime";
    
    } else if (distance_type == "driving_distance") {
        
        nearest_endpoint = "NearestDriveDistance";
        
    } else {
        
        // as the crow flies
        nearest_endpoint = "Nearest";
        
    }
    
    var nearest_search_url = "https://ws.postcoder.com/pcw/"+postcoder_api_key+"/"+nearest_endpoint+"/"+list_id+"/";
    
    var search_input = $("#searchInput").val();
            
    if(search_input != "") {
        
        $("#searchLoader").removeClass("hidden");
    
        var search_url = nearest_search_url + encodeURIComponent(search_input) + "?format=json&identifier=NearestExample";
        
        $.getJSON(search_url, function (data) {
            
            if(data.places.length > 0) {
            
                add_markers_to_map(data.places);

                $("#searchResults").empty();

                $("#searchResultsIntro").addClass("hidden");

                $.each(data.places, function(index, value) {
                    
                    if (distance_type == "driving_duration") {
                        
                        $("#searchResults").append("<li id='marker_"+index+"'><h4><a href='"+value.url+"'>"+value.name+"</a><br><small>"+format_duration(value.driveduration)+" away</small></h4></li>");
                        
                    } else if (distance_type == "driving_distance") {

                        $("#searchResults").append("<li id='marker_"+index+"'><h4><a href='"+value.url+"'>"+value.name+"</a><br><small>"+format_distance(value.drivedistance)+" miles away</small></h4></li>");

                    } else {

                        $("#searchResults").append("<li id='marker_"+index+"'><h4><a href='"+value.url+"'>"+value.name+"</a><br><small>"+format_distance(value.distance)+" miles away</small></h4></li>");
                    
                    }

                    $("#marker_"+index).append("<p class='hidden'>"+value.description+"</p>");

                })
            
                // show search source as marker on map
                if (typeof show_source == "undefined") { show_source = true }

                if (show_source === true) {

                    if(typeof data.source != "undefined") {

                        add_source_to_map(data.source);

                    }

                }

                $("#searchResults li h4 a").on("click", function(e) {
                   e.preventDefault(); 

                    var marker_id = $(this).parent().parent().attr("id").replace("marker_","");

                    click_result(marker_id);
                });

                $("#searchLoader").addClass("hidden");
                
            } else {
                
                alert("Postcode not found");

                $("#searchLoader").addClass("hidden");
                
            }
            
        }).error(function() { 
                    
            $("#searchLoader").addClass("hidden");
            alert("An error has occurred"); 

        });
        
    }
    
}

// Run a geo search using lat and long function on button click
$("#geoButton").on("click", function(e) {
    
    e.preventDefault();
    
    perform_geo_search();
    
});

function perform_geo_search(position) { 
    
    // NOTE: Chrome no longer supports geolocation on non secure sites, so you will need to host page on HTTPS
    // https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins
    
    if(typeof position == "undefined") {
    
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(perform_geo_search);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
        
    } else {
    
        if (typeof distance_type == "undefined") { distance_type = "" }
        
        // Order by driving duration
        if (distance_type == "driving_duration") {
            
            nearest_endpoint = "nearestdriveduration";
        
        // Order by driving distance
        } else if (distance_type == "driving_distance") {

            nearest_endpoint = "nearestdrivedistance";

        // Order by straight line distance
        } else {
            
            nearest_endpoint = "nearest";

        }
        
        // Build base URL
        var nearest_search_url = "https://ws.postcoder.com/pcw/"+postcoder_api_key+"/"+nearest_endpoint+"/"+list_id+"/geo";

        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        if(longitude != "" && latitude != "") {

            $("#searchLoader").removeClass("hidden");

            // Add query string elements to base URL
            var search_url = nearest_search_url + "?latitude="+latitude+"&longitude="+longitude+"&format=json&identifier=NearestExample";

            $.getJSON(search_url, function (data) {

                if(data.places.length > 0) {
                    
                    // Pass places to our map markers function
                    add_markers_to_map(data.places);

                    $("#searchResults").empty();

                    $("#searchResultsIntro").addClass("hidden");

                    // Cycle through places and build results list
                    $.each(data.places, function(index, value) {
                        
                        // Create item in list
                        if (distance_type == "driving_duration") {

                            $("#searchResults").append("<li id='marker_"+index+"'><h4><a href='"+value.url+"'>"+value.name+"</a><br><small>"+format_duration(value.driveduration)+" away</small></h4></li>");

                        } else if (distance_type == "driving_distance") {

                            $("#searchResults").append("<li id='marker_"+index+"'><h4><a href='"+value.url+"'>"+value.name+"</a><br><small>"+format_distance(value.drivedistance)+" miles away</small></h4></li>");

                        } else {

                            $("#searchResults").append("<li id='marker_"+index+"'><h4><a href='"+value.url+"'>"+value.name+"</a><br><small>"+format_distance(value.distance)+" miles away</small></h4></li>");

                        }
                        
                        // Add a description to the item in the lsit (could use another field like openinghours or a custom field)
                        $("#marker_"+index).append("<p class='hidden'>"+value.description+"</p>");

                    });


                    // Show search source as marker on map
                    if (typeof show_source == "undefined") { show_source = true }

                    if (show_source === true) {

                        if(typeof data.source != "undefined") {

                            add_source_to_map(data.source);

                        }

                    }
                    
                    // Add click handlers to the list items that opens the point on the map when list item is clicked
                    $("#searchResults li h4 a").on("click", function(e) {
                       e.preventDefault(); 

                        var marker_id = $(this).parent().parent().attr("id").replace("marker_","");

                        click_result(marker_id);
                    });

                    $("#searchLoader").addClass("hidden");

                } else {

                    alert("Postcode not found");

                    $("#searchLoader").addClass("hidden");

                }

            }).error(function() { 
                    
                $("#searchLoader").addClass("hidden");
                alert("An error has occurred"); 

            });

        }
        
    }
    
}

// Function to open the item in the results list when a map marker is clicked
function click_result(marker_id) {
    
    $("#searchResults p").addClass("hidden");
    
    $("#marker_"+marker_id+" p.hidden").removeClass("hidden");
    
    $("#searchResults li").removeClass("highlight");
    
    $("#marker_"+marker_id).addClass("highlight");
    
    offset = $("#marker_"+marker_id).offset();
    
    if(marker_id > 0) {
        $("#searchResults").animate({
            scrollTop: offset.top
        });
    } else {
        $("#searchResults").scrollTop(0,0);
    }
    
    open_marker(marker_id);
    
}

// Helper function to convert metres to miles

function format_distance(number) {
    
    var miles = Math.round(number * 0.00062137, -1);
    
    return miles.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
}

// Helper function convert seconds to hours or minutes

function format_duration(number) {
    
    var minutes = Math.round(number / 60);
    
    // If one hour or more show in hour(s)
    
    if (minutes > 60) {
        
        var hours = Math.round(minutes / 60);
    
        if(hours == 1) {
        
            return hours + " hour";
            
        } else {
    
            return hours + " hours";
            
        }
    
    // If less than one hour show in minute(s)
        
    } else {
    
        if(hours == 1) {
        
            return minutes + " minute";
            
        } else {
    
            return minutes + " minutes";
            
        }
        
    }
     
}
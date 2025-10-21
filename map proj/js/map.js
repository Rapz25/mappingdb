$(document).ready(function () {
  const map = L.map('map').setView([10.669644, 122.948844], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let tempMarker = null;
  let markers = [];
  let routeControl = null;
  let markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  function clearForm() {
    $("#lat").val('');
    $("#lng").val('');
    $("#category").val('');
    $("#name").val('');
    $("#description").val('');
  }

  function logToAdminPanel(message) {
    $('#outputBox').text(message);
  }


  // --- Event Listeners for your existing HTML buttons ---

  // Plot New Marker Button
  $('#plotBtn').on('click', function (e) {
    e.stopPropagation(); // Prevent map click if button is over map
    clearForm();
    $("#plotForm").show();
    logToAdminPanel('➕ New Marker button clicked! Select a location on the map.');
  });

  // Refresh Markers Button
  $('#postBtn').on('click', function (e) {
    e.stopPropagation(); // Prevent map click if button is over map
    logToAdminPanel('Refresh Markers button clicked! Fetching locations...');
    // Existing AJAX call to fetch locations
    $.ajax({
      url: "forms/fetch_location.php",
      type: "GET",
      success: function (response) {
        var res = JSON.parse(response);
        if (res.status === "success") {
          // Clear existing markers and cluster group
          markerClusterGroup.clearLayers();
          markers = [];

          res.data.forEach(function (loc) {
            let lat = parseFloat(loc.latitude);
            let lng = parseFloat(loc.longitude);
            let desc = loc.description;
            let cat = loc.category;
            let name = loc.name;
            let id = loc.id;

            let iconpath = '';
            if (cat === 'Gas') {
              iconpath = 'assets/images/gas.png';
            } else if (cat === 'EV') {
              iconpath = 'assets/images/ev.png';
            }

            var customIcon = L.icon({
              iconUrl: iconpath,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -50]
            });
            var marker = L.marker([lat, lng], { icon: customIcon });

            // Store location ID in marker for deletion
            marker.locationId = id;
            marker.locationName = name;

            marker.bindPopup(
              "<b>" + name.toUpperCase() + "</b><br>" + cat + "<br>" + desc +
              "<br><button onclick='deleteMarker(" + id + ", \"" + name + "\")' style='margin-top: 5px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;'>Delete</button>",
              { autoClose: false, closeOnClick: false }
            );

            // Add marker to cluster group instead of directly to map
            markerClusterGroup.addLayer(marker);
            markers.push(marker);
          });

          // Add cluster group to map
          map.addLayer(markerClusterGroup);
          logToAdminPanel(`Refreshed! Found ${res.data.length} locations with clustering.`);
        } else {
          logToAdminPanel("No locations found.");
          alert("No locations found.");
        }
      },
      error: function () {
        logToAdminPanel("Error fetching locations.");
        alert("Error fetching locations.");
      }
    });
  });

  // Delete Marker Button
  $('#deleteBtn').on('click', function (e) {
    e.stopPropagation();
    logToAdminPanel('🗑️ Delete Marker mode activated! Click on a marker to delete it.');
    map.getContainer().style.cursor = "crosshair";

    // Disable normal map click handler
    map.off("click", mapClickHandler);

    // Add temporary click handler for deletion
    function deleteClickHandler(e) {
      // Check if clicked on a marker
      let clickedMarker = null;
      markers.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        const distance = map.distance(e.latlng, markerLatLng);
        if (distance < 50) { // 50 meter tolerance
          clickedMarker = marker;
        }
      });

      if (clickedMarker && clickedMarker.locationId) {
        if (confirm(`Delete "${clickedMarker.locationName}"?`)) {
          deleteMarkerById(clickedMarker.locationId, clickedMarker.locationName);
        }
      } else {
        logToAdminPanel('No marker found at this location. Try clicking closer to a marker.');
      }

      // Reset cursor and re-enable normal map clicks
      map.getContainer().style.cursor = "";
      map.off("click", deleteClickHandler);
      map.on("click", mapClickHandler);
    }

    map.on("click", deleteClickHandler);
  });

  // Clear All Markers Button
  $('#clearBtn').on('click', function (e) {
    e.stopPropagation(); // Prevent map click if button is over map
    logToAdminPanel('🗑️ Clear All Markers button clicked! Clearing map...');
    map.setView([10.669644, 122.948844], 17); // Reset view as well
    markerClusterGroup.clearLayers();
    markers = [];
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
    if (tempMarker) { // Clear any temporary marker
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
    $("#plotForm").hide(); // Hide form if open
    logToAdminPanel('Map cleared and reset.');
  });

  // Reset Zoom Button (now in sidebar)
  $('#resetZoomBtn').on('click', function (e) {
    e.stopPropagation();
    map.setView([10.669644, 122.948844], 17);
    logToAdminPanel('↩️ Zoom reset to initial view.');
  });

  // Show Route Button (now in sidebar)
  $('#showRouteBtn').on('click', function (e) {
    e.stopPropagation();
    logToAdminPanel('🗺️ Show Route button clicked! Select start point on map.');
    map.getContainer().style.cursor = "crosshair";

    // Disable normal map clicks for plotting marker during route selection
    map.off("click", mapClickHandler);

    function onMapClick(e) {
      const fromLatLng = e.latlng;
      logToAdminPanel('Start point selected. Now select destination point.');
      map.getContainer().style.cursor = "crosshair"; // Keep crosshair for destination
      map.off("click", onMapClick); // Remove listener for start point

      function onDestinationClick(e2) {
        const toLatLng = e2.latlng;
        map.off("click", onDestinationClick); // Remove listener for destination point
        map.getContainer().style.cursor = ""; // Reset cursor

        if (routeControl) {
          map.removeControl(routeControl);
        }

        routeControl = L.Routing.control({
          waypoints: [
            L.latLng(fromLatLng.lat, fromLatLng.lng),
            L.latLng(toLatLng.lat, toLatLng.lng)
          ],
          routeWhileDragging: false,
          draggableWaypoints: false,
          addWaypoints: false,
          createMarker: () => null,
          lineOptions: {
            styles: [{ color: 'blue', weight: 6, opacity: 0.7 }]
          }
        }).addTo(map);

        routeControl.on('routesfound', function (e) {
          var routes = e.routes;
          var summary = routes[0].summary;
          logToAdminPanel(`Route displayed! Distance: ${Math.round(summary.totalDistance / 1000)} km, Time: ${Math.round(summary.totalTime / 60)} minutes. Showing nearby stations...`);
          // Find and show nearby stations along the route
          showNearbyStationsAlongRoute(fromLatLng, toLatLng);
        });

        // Re-enable normal map click handler after route selection is complete
        map.on("click", mapClickHandler);
      }

      map.on("click", onDestinationClick);
    }

    map.on("click", onMapClick);
  });

  // REMOVED: The customControl definition is no longer needed since its buttons are in the sidebar


  // Simple distance calculation between two points (remains the same)
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const latDiff = (lat2 - lat1) * 111320;
    const lngDiff = (lng2 - lng1) * 111320 * Math.cos((lat1 + lat2) * Math.PI / 360);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  // Check if a point is close to a line segment (the route) (remains the same)
  function isPointNearRoute(start, end, point, maxDistance = 500) {
    const A = { lat: start.lat, lng: start.lng };
    const B = { lat: end.lat, lng: end.lng };
    const P = { lat: point.lat, lng: point.lng };

    const AB = calculateDistance(A.lat, A.lng, B.lat, B.lng);
    const AP = calculateDistance(A.lat, A.lng, P.lat, P.lng);
    const BP = calculateDistance(B.lat, B.lng, P.lat, P.lng);

    const minDistanceToEndpoints = Math.min(AP, BP);
    const isBetween = Math.abs(AP + BP - AB) < (AB * 0.3);

    return minDistanceToEndpoints <= maxDistance && isBetween;
  }

  // Function to show nearby stations along the route (remains the same, but with logging)
  function showNearbyStationsAlongRoute(start, end) {
    markers.forEach(marker => {
      map.removeLayer(marker);
    });
    markers = [];

    $.ajax({
      url: "forms/fetch_location.php",
      type: "GET",
      success: function (response) {
        var res = JSON.parse(response);
        if (res.status === "success") {
          const nearbyStations = [];
          let stationsFound = false;

          res.data.forEach(function (loc) {
            let lat = parseFloat(loc.latitude);
            let lng = parseFloat(loc.longitude);
            let desc = loc.description;
            let cat = loc.category;
            let name = loc.name;

            if ((cat === 'Gas' || cat === 'EV') &&
              isPointNearRoute(start, end, { lat: lat, lng: lng }, 500)) {

              let iconpath = '';
              if (cat === 'Gas') {
                iconpath = 'assets/images/gas.png';
              } else if (cat === 'EV') {
                iconpath = 'assets/images/ev.png';
              }

              var customIcon = L.icon({
                iconUrl: iconpath,
                iconSize: [50, 50],
                iconAnchor: [25, 50],
                popupAnchor: [0, -50]
              });

              var marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
              marker.bindPopup(
                "<b>" + name.toUpperCase() + "</b><br>" + cat + "<br>" + desc,
                { autoClose: false, closeOnClick: false }
              );
              markers.push(marker);
              nearbyStations.push({ name: name, category: cat });
              stationsFound = true;
            }
          });

          if (!stationsFound) {
            logToAdminPanel("No Gas or EV stations found near the route.");
            alert("No Gas or EV stations found near the route.");
          } else {
            logToAdminPanel(`Found ${nearbyStations.length} nearby stations along the route.`);
            console.log("Found nearby stations along route:", nearbyStations);
          }
        } else {
          logToAdminPanel("No locations found on server for route check.");
          alert("No locations found.");
        }
      },
      error: function () {
        logToAdminPanel("Error fetching locations for route check.");
        alert("Error fetching locations.");
      }
    });
  }

  // --- Plot Form Buttons (inside the form, these are okay) ---
  $("#newBtn").click(function (e) {
    e.stopPropagation();
    clearForm();
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
    logToAdminPanel('✨ Plot Form cleared.');
  });

  $("#closeForm").click(function (e) {
    e.stopPropagation();
    $("#plotForm").hide();
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
    logToAdminPanel('Plot Form closed.');
  });

  // Map behavior when form is visible (remains the same)
  map.on("movestart", function () {
    if ($("#plotForm").is(":visible")) {
      if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
      }
      $("#plotForm").hide();
      logToAdminPanel('Map moved, Plot Form hidden.');
    }
  });

  // Map click handler for plotting - simplified to always show form on click
  function mapClickHandler(e) {
    // Check if the click originated from within the plotForm or a Leaflet control
    if ($(e.originalEvent.target).closest("#plotForm, .leaflet-control, .leaflet-routing-container").length > 0) {
      return;
    }

    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    if (tempMarker) {
      map.removeLayer(tempMarker);
    }

    tempMarker = L.marker([lat, lng]).addTo(map);

    clearForm();
    $("#plotForm").show(); // Always show form when map is clicked
    $("#lat").val(lat);
    $("#lng").val(lng);
    logToAdminPanel(`Map clicked at Lat: ${lat}, Lng: ${lng}. Plot form opened.`);
  }

  map.on("click", mapClickHandler);

  // Save Marker Button (inside the form, remains the same, with logging)
  $("#saveBtn").click(function (e) {
    e.stopPropagation();
    var lat = parseFloat($("#lat").val());
    var lng = parseFloat($("#lng").val());
    var category = $("#category").val();
    var name = $("#name").val();
    var description = $("#description").val();

    if (!isNaN(lat) && !isNaN(lng) && category !== "" && name !== "") { // Added name validation
      logToAdminPanel('Attempting to save new marker...');
      $.ajax({
        url: "forms/save_location.php",
        type: "POST",
        data: {
          latitude: lat,
          longitude: lng,
          category: category,
          name: name,
          description: description
        },
        success: function (response) {
          var res = JSON.parse(response);

          if (res.status === "success") {
            if (tempMarker) {
              map.removeLayer(tempMarker);
              tempMarker = null;
            }

            let iconpath = '';
            if (category === 'Gas') {
              iconpath = 'assets/images/gas.png';
            } else if (category === 'EV') {
              iconpath = 'assets/images/ev.png';
            }

            var customIcon = L.icon({
              iconUrl: iconpath,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -50]
            });

            var marker = L.marker([lat, lng], { icon: customIcon });

            marker.bindPopup(
              "<b>" + name.toUpperCase() + "</b><br>" + category + "<br>" + description,
              { autoClose: false, closeOnClick: false }
            );

            // Add to cluster group
            markerClusterGroup.addLayer(marker);


            $("#plotForm").hide();
            logToAdminPanel(`Marker "${name}" saved successfully!`);
            alert("Saved successfully!");
          } else {
            logToAdminPanel(`Error saving marker: ${res.message}`);
            alert(res.message);
          }
        },
        error: function () {
          logToAdminPanel("Error connecting to server to save marker.");
          alert("Error connecting to server.");
        }
      });
    } else {
      logToAdminPanel("Validation Error: Please fill all required fields (Lat, Lng, Category, Name).");
      alert("Please enter valid latitude, longitude, category, and name.");
    }
  });

  // Global delete function for popup buttons
  window.deleteMarker = function (id, name) {
    console.log("Delete button clicked for ID:", id, "Name:", name);
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMarkerById(id, name);
    }
  };

  // Delete marker by ID function
  function deleteMarkerById(id, name) {
    logToAdminPanel(`Attempting to delete marker: ${name} (ID: ${id})...`);
    console.log("Deleting marker with ID:", id, "Name:", name);

    $.ajax({
      url: "forms/delete_location.php",
      type: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ id: id }),
      success: function (response) {
        console.log("Delete response:", response);
        console.log("Response type:", typeof response);

        // Check if response is already an object (jQuery might auto-parse)
        let res;
        if (typeof response === 'object') {
          res = response;
        } else {
          try {
            res = JSON.parse(response);
          } catch (e) {
            console.error("JSON parse error:", e);
            console.error("Raw response:", response);
            logToAdminPanel(`Server response error: Invalid JSON - ${response.substring(0, 100)}`);
            alert(`Server response error: ${response.substring(0, 100)}`);
            return;
          }
        }

        if (res.status === "success") {
          // Remove marker from cluster group
          markers = markers.filter(marker => {
            if (marker.locationId == id) {
              markerClusterGroup.removeLayer(marker);
              return false;
            }
            return true;
          });

          logToAdminPanel(`Marker "${name}" deleted successfully!`);
          alert("Marker deleted successfully!");
        } else {
          logToAdminPanel(`Error deleting marker: ${res.message}`);
          alert(`Error: ${res.message}`);
          if (res.debug) {
            console.log("Debug info:", res.debug);
          }
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", xhr, status, error);
        logToAdminPanel("Error connecting to server to delete marker.");
        alert("Error connecting to server: " + error);
      }
    });
  }
});
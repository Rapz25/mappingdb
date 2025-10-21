$(document).ready(function () {
  // ========================================
  // ADMIN MAP INITIALIZATION
  // ========================================
  // Initialize Leaflet map centered on default coordinates
  const map = L.map('map').setView([10.669644, 122.948844], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Admin panel variables
  let tempMarker = null; // Temporary marker when selecting location
  let markers = []; // Array to store all permanent markers
  let routeControl = null; // Stores routing control instance
  
  // ========================================
  // MARKER CLUSTERING FOR ADMIN VIEW
  // ========================================
  // Create marker cluster group for better performance with many markers
  let markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  // Clear all form fields when creating new marker
  function clearForm() {
    $("#lat").val('');
    $("#lng").val('');
    $("#category").val('');
    $("#name").val('');
    $("#description").val('');
  }

  // Clear all routes from the admin map
  function clearRoutes() {
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
  }

  // Show the plot form for adding new location
  $('#plotBtn').on('click', function (e) {
    e.stopPropagation();
    clearRoutes(); // Clear routes when opening plot form
    clearForm();
    $("#plotForm").show();
  });

  // Load and display all locations from database
  $('#postBtn').on('click', function (e) {
    e.stopPropagation();
    clearRoutes(); // Clear routes when loading markers
    $.ajax({
      url: "forms/fetch_location.php",
      type: "GET",
      success: function (response) {
        var res = JSON.parse(response);
        if (res.status === "success") {
          // Clear existing markers before adding new ones
          markerClusterGroup.clearLayers();
          markers = [];

          // Create marker for each location
          res.data.forEach(function (loc) {
            let lat = parseFloat(loc.latitude);
            let lng = parseFloat(loc.longitude);
            let desc = loc.description;
            let cat = loc.category;
            let name = loc.name;
            let id = loc.id;

            // Choose icon based on category
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

            // Store location data in marker
            marker.locationId = id;
            marker.locationName = name;

            // Add popup with delete button
            marker.bindPopup(
              "<b>" + name.toUpperCase() + "</b><br>" + cat + "<br>" + desc +
              "<br><button onclick='deleteMarker(" + id + ", \"" + name + "\")' style='margin-top: 5px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;'>Delete</button>",
              { autoClose: false, closeOnClick: false }
            );

            markerClusterGroup.addLayer(marker);
            markers.push(marker);
          });

          map.addLayer(markerClusterGroup);
        } else {
          alert("No locations found.");
        }
      },
      error: function () {
        alert("Error fetching locations.");
      }
    });
  });

  // Delete marker by clicking on it
  $('#deleteBtn').on('click', function (e) {
    e.stopPropagation();
    clearRoutes(); // Clear routes when entering delete mode
    map.getContainer().style.cursor = "crosshair";
    map.off("click", mapClickHandler);

    function deleteClickHandler(e) {
      let clickedMarker = null;
      // Find marker near click location
      markers.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        const distance = map.distance(e.latlng, markerLatLng);
        if (distance < 50) {
          clickedMarker = marker;
        }
      });

      if (clickedMarker && clickedMarker.locationId) {
        if (confirm(`Delete "${clickedMarker.locationName}"?`)) {
          deleteMarkerById(clickedMarker.locationId, clickedMarker.locationName);
        }
      }

      map.getContainer().style.cursor = "";
      map.off("click", deleteClickHandler);
      map.on("click", mapClickHandler);
    }

    map.on("click", deleteClickHandler);
  });

  // Clear all markers, routes, and reset map
  $('#clearBtn').on('click', function (e) {
    e.stopPropagation();
    map.setView([10.669644, 122.948844], 17);
    markerClusterGroup.clearLayers();
    markers = [];
    clearRoutes(); // Use the clearRoutes function
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
    $("#plotForm").hide();
  });

  // Reset map view to default position
  $('#resetZoomBtn').on('click', function (e) {
    e.stopPropagation();
    clearRoutes(); // Clear routes when resetting zoom
    map.setView([10.669644, 122.948844], 17);
  });

  // Create route between two points and show nearby stations
  $('#showRouteBtn').on('click', function (e) {
    e.stopPropagation();
    map.getContainer().style.cursor = "crosshair";
    map.off("click", mapClickHandler);

    // Wait for first click (start point)
    function onMapClick(e) {
      const fromLatLng = e.latlng;
      map.getContainer().style.cursor = "crosshair";
      map.off("click", onMapClick);

      // Wait for second click (destination point)
      function onDestinationClick(e2) {
        const toLatLng = e2.latlng;
        map.off("click", onDestinationClick);
        map.getContainer().style.cursor = "";

        // Remove existing route if present
        if (routeControl) {
          map.removeControl(routeControl);
        }

        // Create routing control
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

        // When route is found, show nearby stations along it
        routeControl.on('routesfound', function (e) {
          showNearbyStationsAlongRoute(fromLatLng, toLatLng);
        });

        map.on("click", mapClickHandler);
      }

      map.on("click", onDestinationClick);
    }

    map.on("click", onMapClick);
  });

  // Calculate distance between two coordinates in meters
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const latDiff = (lat2 - lat1) * 111320;
    const lngDiff = (lng2 - lng1) * 111320 * Math.cos((lat1 + lat2) * Math.PI / 360);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  // Check if a point is near the route within maxDistance
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

  // Display stations that are near the route
  function showNearbyStationsAlongRoute(start, end) {
    // Clear existing markers
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

          // Filter and display only stations near the route
          res.data.forEach(function (loc) {
            let lat = parseFloat(loc.latitude);
            let lng = parseFloat(loc.longitude);
            let desc = loc.description;
            let cat = loc.category;
            let name = loc.name;

            // Check if station is near route within 500m
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
            alert("No Gas or EV stations found near the route.");
          } else {
            console.log("Found nearby stations along route:", nearbyStations);
          }
        } else {
          alert("No locations found.");
        }
      },
      error: function () {
        alert("Error fetching locations.");
      }
    });
  }

  // Clear form and temporary marker when creating new location
  $("#newBtn").click(function (e) {
    e.stopPropagation();
    clearForm();
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
  });

  // Close the plot form
  $("#closeForm").click(function (e) {
    e.stopPropagation();
    $("#plotForm").hide();
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
  });

  // Hide form when map is moved
  map.on("movestart", function () {
    if ($("#plotForm").is(":visible")) {
      if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
      }
      $("#plotForm").hide();
    }
  });

  // Handle map clicks to place temporary marker and show form
  function mapClickHandler(e) {
    // Ignore clicks on form or controls
    if ($(e.originalEvent.target).closest("#plotForm, .leaflet-control, .leaflet-routing-container").length > 0) {
      return;
    }

    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    // Remove old temporary marker
    if (tempMarker) {
      map.removeLayer(tempMarker);
    }

    // Add new temporary marker at clicked location
    tempMarker = L.marker([lat, lng]).addTo(map);

    // Show form with coordinates pre-filled
    clearForm();
    $("#plotForm").show();
    $("#lat").val(lat);
    $("#lng").val(lng);
  }

  map.on("click", mapClickHandler);

  // Save new location to database
  $("#saveBtn").click(function (e) {
    e.stopPropagation();
    var lat = parseFloat($("#lat").val());
    var lng = parseFloat($("#lng").val());
    var category = $("#category").val();
    var name = $("#name").val();
    var description = $("#description").val();

    // Validate form inputs
    if (!isNaN(lat) && !isNaN(lng) && category !== "" && name !== "") {
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
            // Remove temporary marker
            if (tempMarker) {
              map.removeLayer(tempMarker);
              tempMarker = null;
            }

            // Choose icon based on category
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

            // Create permanent marker for saved location
            var marker = L.marker([lat, lng], { icon: customIcon });

            marker.bindPopup(
              "<b>" + name.toUpperCase() + "</b><br>" + category + "<br>" + description,
              { autoClose: false, closeOnClick: false }
            );

            markerClusterGroup.addLayer(marker);
            $("#plotForm").hide();
            alert("Saved successfully!");
          } else {
            alert(res.message);
          }
        },
        error: function () {
          alert("Error connecting to server.");
        }
      });
    } else {
      alert("Please enter valid latitude, longitude, category, and name.");
    }
  });

  // Global function to delete marker from popup button
  window.deleteMarker = function (id, name) {
    console.log("Delete button clicked for ID:", id, "Name:", name);
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMarkerById(id, name);
    }
  };

  // Delete marker from database and map
  function deleteMarkerById(id, name) {
    console.log("Deleting marker with ID:", id, "Name:", name);

    $.ajax({
      url: "forms/delete_location.php",
      type: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ id: id }),
      success: function (response) {
        console.log("Delete response:", response);
        console.log("Response type:", typeof response);

        // Parse response if it's a string
        let res;
        if (typeof response === 'object') {
          res = response;
        } else {
          try {
            res = JSON.parse(response);
          } catch (e) {
            console.error("JSON parse error:", e);
            console.error("Raw response:", response);
            alert(`Server response error: ${response.substring(0, 100)}`);
            return;
          }
        }

        if (res.status === "success") {
          // Remove marker from array and map
          markers = markers.filter(marker => {
            if (marker.locationId == id) {
              markerClusterGroup.removeLayer(marker);
              return false;
            }
            return true;
          });

          alert("Marker deleted successfully!");
        } else {
          alert(`Error: ${res.message}`);
          if (res.debug) {
            console.log("Debug info:", res.debug);
          }
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", xhr, status, error);
        alert("Error connecting to server: " + error);
      }
    });
  }
});
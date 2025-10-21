let map;
let routeControl = null;
let userLocationMarker = null;
let currentRouteLine = null;

$(document).ready(function () {
  map = L.map('map').setView([10.669644, 122.948844], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let markers = [];
  let allLocations = [];
  let markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  function log(msg) {
    const box = $("#outputBox");
    box.append(`<div>• ${msg}</div>`);
    box.scrollTop(box[0].scrollHeight);
  }

  function loadMarkers(filter = "All", searchTerm = "") {
    $.ajax({
      url: "forms/fetch_location.php",
      type: "GET",
      success: function (response) {
        const res = JSON.parse(response);
        if (res.status === "success") {
          allLocations = res.data; // save data for search function
          clearMarkers();

          let filteredLocations = res.data.filter(loc => {

            if (filter !== "All" && loc.category !== filter) return false;


            if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
          });

          filteredLocations.forEach(loc => {
            const { latitude, longitude, category, name, description } = loc;

            const iconPath = category === "Gas"
              ? "assets/images/gas.png"
              : "assets/images/EV.png";

            const customIcon = L.icon({
              iconUrl: iconPath,
              iconSize: [38, 38],
              iconAnchor: [19, 38],
              popupAnchor: [0, -36],
            });

            const marker = L.marker([latitude, longitude], { icon: customIcon })
              .bindPopup(`<b>${name}</b><br>${category}<br>${description}<br><button onclick="showRealRoute(${latitude}, ${longitude}, '${name.replace(/'/g, "\\'")}')" style="margin-top: 5px; background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Show Route</button>`);

            marker.stationLat = latitude;
            marker.stationLng = longitude;
            marker.stationName = name;
            markerClusterGroup.addLayer(marker);
            markers.push(marker);
          });


          map.addLayer(markerClusterGroup);

          const filterText = filter !== "All" ? filter + " " : "";
          const searchText = searchTerm ? ` matching "${searchTerm}"` : "";
          log(`Loaded ${markers.length} ${filterText}locations${searchText} with clustering.`);
        }
      },
      error: () => log("Error fetching locations."),
    });
  }


  function searchStations() {
    const searchTerm = $("#searchInput").val().trim();
    const currentFilter = $("#categorySelect").val();

    if (searchTerm === "") {
      loadMarkers(currentFilter);
      return;
    }

    loadMarkers(currentFilter, searchTerm);
    log(`Searching for: "${searchTerm}"`);
  }


  function findUserLocation() {
    if (!navigator.geolocation) {
      log("Geolocation is not supported by this browser.");
      return;
    }

    log("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;


        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }

        // Add user location marker
        userLocationMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }).addTo(map).bindPopup("Your Location").openPopup();


        map.setView([lat, lng], 15);
        log(`Location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      function (error) {
        let errorMsg = "Unable to get location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Position unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Request timeout.";
            break;
          default:
            errorMsg += "Unknown error.";
            break;
        }
        log(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }


  function findNearbyStations() {
    if (!navigator.geolocation) {
      log("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (allLocations.length === 0) {
          log("No stations loaded. Please load stations first.");
          return;
        }


        const stationsWithDistance = allLocations.map(station => {
          const distance = calculateDistance(userLat, userLng, station.latitude, station.longitude);
          return { ...station, distance };
        }).sort((a, b) => a.distance - b.distance);


        const nearbyStations = stationsWithDistance.filter(station => station.distance <= 5);

        clearMarkers();

        nearbyStations.forEach((loc, index) => {
          const { latitude, longitude, category, name, description, distance } = loc;

          const iconPath = category === "Gas"
            ? "assets/images/gas.png"
            : "assets/images/EV.png";

          const customIcon = L.icon({
            iconUrl: iconPath,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -36],
          });

          const marker = L.marker([latitude, longitude], { icon: customIcon })
            .bindPopup(`<b>${name}</b><br>${category}<br>${description}<br><strong>Distance: ${distance.toFixed(2)} km</strong><br><button onclick="showRealRoute(${latitude}, ${longitude}, '${name.replace(/'/g, "\\'")}')" style="margin-top: 5px; background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Show Route</button>`, {
              autoClose: false,
              closeOnClick: false
            });

          // Add to cluster group
          markerClusterGroup.addLayer(marker);
          markers.push(marker);
        });

        // Add cluster group to map
        map.addLayer(markerClusterGroup);

        // Add user location marker
        findUserLocation();

        // Auto-open popups for nearby stations with a delay
        setTimeout(() => {
          nearbyStations.forEach((loc, index) => {
            const marker = markers.find(m => {
              const markerPos = m.getLatLng();
              return Math.abs(markerPos.lat - loc.latitude) < 0.0001 &&
                Math.abs(markerPos.lng - loc.longitude) < 0.0001;
            });

            if (marker) {
              // Stagger popup opening to avoid overlap
              setTimeout(() => {
                marker.openPopup();
              }, index * 200); // 200ms delay between each popup
            }
          });
        }, 1000); // Wait 1 second for map to settle

        // Create detailed list in activity log
        let detailsText = `Found ${nearbyStations.length} stations within 5km:\n\n`;
        nearbyStations.forEach((station, index) => {
          detailsText += `${index + 1}. ${station.name}\n`;
          detailsText += `   Type: ${station.category}\n`;
          detailsText += `   Distance: ${station.distance.toFixed(2)} km\n`;
          detailsText += `   Description: ${station.description || 'N/A'}\n\n`;
        });

        // Update activity log with detailed information
        const box = $("#outputBox");
        box.text(detailsText);
        box.scrollTop(0);

        log(`Found ${nearbyStations.length} stations within 5km. Popups opened automatically.`);
      },
      function (error) {
        log("Unable to get location for nearby search.");
      }
    );
  }

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function clearMarkers() {
    markerClusterGroup.clearLayers();
    markers = [];
  }

  $("#resetBtn").click(() => {
    map.setView([10.669644, 122.948844], 17);
    log("Reset map to default view.");
  });

  $("#clearBtn").click(() => {
    clearMarkers();
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
    log("Cleared all markers and routes.");
  });

  $("#postBtn").click(() => {
    const selected = $("#categorySelect").val();
    loadMarkers(selected);
  });

  $("#routeBtn").click(() => {
    log("Select two points on the map to create a route.");

    // Change cursor to indicate route selection mode
    map.getContainer().style.cursor = "crosshair";

    let points = [];
    let startMarker = null;

    map.once("click", function (e1) {
      points.push(e1.latlng);

      // Add temporary start marker
      startMarker = L.marker(e1.latlng, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      }).addTo(map).bindPopup("Start Point").openPopup();

      log("Start point selected. Click destination point.");

      map.once("click", function (e2) {
        points.push(e2.latlng);

        // Add temporary end marker
        const endMarker = L.marker(e2.latlng, {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }).addTo(map).bindPopup("End Point").openPopup();

        // Reset cursor
        map.getContainer().style.cursor = "";

        // Remove existing route if any
        if (routeControl) {
          map.removeControl(routeControl);
        }

        log("Creating route...");

        routeControl = L.Routing.control({
          waypoints: [points[0], points[1]],
          createMarker: () => null, // We use our own markers
          draggableWaypoints: false,
          routeWhileDragging: false,
          addWaypoints: false,
          lineOptions: {
            styles: [
              { color: '#2563eb', weight: 6, opacity: 0.8 },
              { color: '#ffffff', weight: 2, opacity: 1 }
            ]
          },
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
          })
        }).addTo(map);

        // Handle route found event
        routeControl.on('routesfound', function (e) {
          const routes = e.routes;
          const summary = routes[0].summary;
          const distance = (summary.totalDistance / 1000).toFixed(2);
          const time = Math.round(summary.totalTime / 60);

          // Auto-zoom to fit the route
          const routeBounds = L.latLngBounds([points[0], points[1]]);
          map.fitBounds(routeBounds, { padding: [50, 50] });

          // Update activity log with route details
          const routeDetails = `Route created successfully!\n\nDistance: ${distance} km\nEstimated time: ${time} minutes\n\nRoute is highlighted in blue on the map.`;
          const box = $("#outputBox");
          box.text(routeDetails);

          log(`Route: ${distance} km, ${time} min. Map zoomed to fit route.`);

          // Remove temporary markers after a delay
          setTimeout(() => {
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
          }, 3000);
        });

        // Handle routing errors
        routeControl.on('routingerror', function (e) {
          log("Error creating route. Please try different points.");
          map.getContainer().style.cursor = "";
          if (startMarker) map.removeLayer(startMarker);
          if (endMarker) map.removeLayer(endMarker);
        });
      });
    });
  });

  $("#categorySelect").change(() => {
    const selected = $("#categorySelect").val();
    const searchTerm = $("#searchInput").val().trim();
    loadMarkers(selected, searchTerm);
  });

  // Search event listeners
  $("#searchBtn").click(() => {
    searchStations();
  });

  $("#searchInput").keypress(function (e) {
    if (e.which === 13) { // Enter key
      searchStations();
    }
  });

  // Clear search when input is empty
  $("#searchInput").on('input', function () {
    if ($(this).val().trim() === "") {
      const currentFilter = $("#categorySelect").val();
      loadMarkers(currentFilter);
    }
  });

  // Geolocation event listeners
  $("#findMeBtn").click(() => {
    findUserLocation();
  });

  $("#nearbyBtn").click(() => {
    findNearbyStations();
  });



  loadMarkers();
});

// test function for debugging routes
window.testRoute = function (lat, lng, name) {
  console.log("testRoute called with:", lat, lng, name);
  alert(`Testing route to ${name} at ${lat}, ${lng}`);

  // Create a simple red line for testing
  const testLine = L.polyline([
    [10.669644, 122.948844], // Default center
    [lat, lng]
  ], {
    color: 'black',
    weight: 3,
    opacity: 1
  }).addTo(map);

  // Zoom to show the line
  map.fitBounds(testLine.getBounds(), { padding: [20, 20] });

  // Update activity log directly
  const box = $("#outputBox");
  if (box.length) {
    box.text(`Test route to ${name} created!`);
  }
  console.log(`Test route to ${name} created!`);
};

// Global variable already declared at top

// show route from user to selected station
window.showRouteToStation = function (stationLat, stationLng, stationName) {
  console.log("showRouteToStation called:", stationLat, stationLng, stationName);

  if (!navigator.geolocation) {
    console.log("Geolocation not supported. Cannot show route.");
    return;
  }

  console.log(`Getting location for route to ${stationName}...`);

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      console.log("User:", userLat, userLng, "Station:", stationLat, stationLng);

      // Remove existing route line
      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      // Remove existing route control
      if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
      }

      // Remove previous user marker
      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      // Add user location marker
      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      // Create direct line
      currentRouteLine = L.polyline([
        [userLat, userLng],
        [stationLat, stationLng]
      ], {
        color: '#2563eb',
        weight: 6,
        opacity: 0.8
      }).addTo(map);

      // Zoom to show the line
      const bounds = L.latLngBounds([
        [userLat, userLng],
        [stationLat, stationLng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Calculate distance
      const distance = calculateDistance(userLat, userLng, stationLat, stationLng);

      // Update activity log
      const box = $("#outputBox");
      box.text(`Route to ${stationName}:\n\nDistance: ${distance.toFixed(2)} km\n\nBlue line shows direct path.`);

      console.log(`Route to ${stationName}: ${distance.toFixed(2)} km. Line drawn and zoomed.`);

    },
    function (error) {
      console.error("Location error:", error);
      console.log("Could not get your location.");
    }
  );
};

// Real GPS route function
window.showRealRoute = function (stationLat, stationLng, stationName) {
  console.log("showRealRoute called with:", stationLat, stationLng, stationName);

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  // Update activity log
  const box = $("#outputBox");
  if (box.length) {
    box.text(`Getting your location for route to ${stationName}...`);
  }

  console.log("Requesting geolocation...");

  // Add a timeout message
  const timeoutId = setTimeout(() => {
    const box = $("#outputBox");
    if (box.length) {
      box.text(`Still getting location... This may take a moment. Click "Allow" if prompted.`);
    }
  }, 3000);

  navigator.geolocation.getCurrentPosition(
    function (position) {
      clearTimeout(timeoutId);
      console.log("SUCCESS: Got location!", position);
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      console.log("User location:", userLat, userLng);
      console.log("Station location:", stationLat, stationLng);

      // Remove existing route line if any
      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      // Remove previous user location marker if exists
      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      // Add user location marker (red)
      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      // Remove existing route control if any
      if (routeControl) {
        map.removeControl(routeControl);
      }

      // Create detailed routing with turn-by-turn directions
      routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(stationLat, stationLng)
        ],
        createMarker: () => null, // We use our own markers
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }]
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
      }).addTo(map);

      // Handle route found event for detailed directions
      routeControl.on('routesfound', function (e) {
        console.log("Route found with directions!", e);
        const routes = e.routes;
        const route = routes[0];
        const summary = route.summary;
        const instructions = route.instructions;

        const totalDistance = (summary.totalDistance / 1000).toFixed(1);
        const totalTime = Math.round(summary.totalTime / 60);

        // Build detailed directions text
        let directionsText = `${stationName}\n`;
        directionsText += `${totalDistance} km, ${totalTime} min\n\n`;

        instructions.forEach((instruction, index) => {
          const distance = instruction.distance;
          let distanceText = '';

          if (distance >= 1000) {
            distanceText = `${(distance / 1000).toFixed(1)} km`;
          } else {
            distanceText = `${Math.round(distance)} m`;
          }

          // Clean up instruction text
          let text = instruction.text || instruction.instruction || 'Continue';

          // Add distance for each step (except the last one)
          if (index < instructions.length - 1) {
            directionsText += `${text} ${distanceText}\n`;
          } else {
            directionsText += `${text}\n`;
          }
        });

        // Auto-zoom to fit the route
        map.fitBounds(route.bounds || [[userLat, userLng], [stationLat, stationLng]], { padding: [50, 50] });

        // Update activity log with detailed directions
        if (box.length) {
          box.text(directionsText);
        }

        console.log("Detailed directions:", directionsText);
      });

      // Handle routing errors - fallback to simple line
      routeControl.on('routingerror', function (e) {
        console.error("Routing error, using simple line:", e);

        // Remove failed route control
        if (routeControl) {
          map.removeControl(routeControl);
          routeControl = null;
        }

        // Create simple fallback line
        currentRouteLine = L.polyline([
          [userLat, userLng],
          [stationLat, stationLng]
        ], {
          color: '#2563eb',
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 10'
        }).addTo(map);

        // Zoom to show the line
        const bounds = L.latLngBounds([
          [userLat, userLng],
          [stationLat, stationLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        // Calculate straight-line distance
        const distance = calculateDistance(userLat, userLng, stationLat, stationLng);

        // Update activity log with simple directions
        if (box.length) {
          box.text(`${stationName}\n${distance.toFixed(1)} km (direct line)\n\nDetailed directions unavailable.\nDashed blue line shows direct path.`);
        }
      });

    },
    function (error) {
      clearTimeout(timeoutId);
      console.error("Geolocation error:", error);
      let errorMsg = "Could not get your location: ";
      let suggestion = "";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += "Permission denied.";
          suggestion = "Please allow location access and try again, or use 'Find My Location' button first.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += "Position unavailable.";
          suggestion = "GPS may be disabled. Try enabling location services.";
          break;
        case error.TIMEOUT:
          errorMsg += "Request timeout.";
          suggestion = "Location request took too long. Try again.";
          break;
        default:
          errorMsg += "Unknown error.";
          suggestion = "Try refreshing the page and allowing location access.";
          break;
      }

      console.log("Error details:", errorMsg, suggestion);
      alert(errorMsg + " " + suggestion);

      const box = $("#outputBox");
      if (box.length) {
        box.text(errorMsg + "\n\n" + suggestion + "\n\nTip: Try clicking 'Find My Location' button first to enable GPS.");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
};
// Initialize global variables for map components
let map;
let routeControl = null;
let userLocationMarker = null;
let currentRouteLine = null;

$(document).ready(function () {
  // Initialize the map centered on default coordinates with zoom level 17
  map = L.map('map').setView([10.669644, 122.948844], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let markers = [];
  let allLocations = [];

  // Create marker cluster group for better performance with many markers
  let markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // Main function to load and display markers on the map
  function loadMarkers(filter = "All", searchTerm = "") {
    $.ajax({
      url: "forms/fetch_location.php",
      type: "GET",
      success: function (response) {
        const res = JSON.parse(response);
        if (res.status === "success") {
          allLocations = res.data;
          clearMarkers();

          // Filter locations based on category and search term
          let filteredLocations = res.data.filter(loc => {
            if (filter !== "All" && loc.category !== filter) return false;
            if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
          });

          filteredLocations.forEach(loc => {
            const { latitude, longitude, category, name, description } = loc;

            // Choose icon based on station category (Gas or EV)
            const iconPath = category === "Gas"
              ? "assets/images/gas.png"
              : "assets/images/EV.png";

            const customIcon = L.icon({
              iconUrl: iconPath,
              iconSize: [38, 38],
              iconAnchor: [19, 38],
              popupAnchor: [0, -36],
            });

            // Create marker with popup containing station info and route button
            const marker = L.marker([latitude, longitude], { icon: customIcon })
              .bindPopup(`<b>${name}</b><br>${category}<br>${description}<br><button onclick="showRealRoute(${latitude}, ${longitude}, '${name.replace(/'/g, "\\'")}')" style="margin-top: 5px; background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Show Route</button>`);

            marker.stationLat = latitude;
            marker.stationLng = longitude;
            marker.stationName = name;
            markerClusterGroup.addLayer(marker);
            markers.push(marker);
          });

          map.addLayer(markerClusterGroup);
        }
      },
      error: () => console.error("Error fetching locations."),
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
  }

  // Get user's current location using browser geolocation API
  function findUserLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Remove existing user location marker if present
        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }

        // Add red marker for user's location
        userLocationMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }).addTo(map).bindPopup("Your Location").openPopup();

        // Center map on user's location
        map.setView([lat, lng], 15);
        console.log(`Location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      function (error) {
        // Handle geolocation errors
        let errorMsg = "Unable to get location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Position unavailable. Please check your GPS settings.";
            break;
          case error.TIMEOUT:
            errorMsg += "Request timeout. Please try again.";
            break;
          default:
            errorMsg += "Unknown error occurred.";
            break;
        }
        alert(errorMsg);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Find and display stations within 5km of user's location
  function findNearbyStations() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (allLocations.length === 0) {
          alert("No stations loaded. Please load stations first by clicking 'Show All Stations'.");
          return;
        }

        // Get current filter selection
        const currentFilter = $("#categorySelect").val();

        // Calculate distance for each station and sort by distance
        const stationsWithDistance = allLocations.map(station => {
          const distance = calculateDistance(userLat, userLng, station.latitude, station.longitude);
          return { ...station, distance };
        }).sort((a, b) => a.distance - b.distance);

        // Filter stations within 5km radius AND by category filter
        const nearbyStations = stationsWithDistance.filter(station => {
          // Check distance (within 5km)
          if (station.distance > 5) return false;

          // Check category filter
          if (currentFilter !== "All" && station.category !== currentFilter) return false;

          return true;
        });

        clearMarkers();

        // Check if any stations were found
        if (nearbyStations.length === 0) {
          const filterText = currentFilter === "All" ? "stations" : `${currentFilter} stations`;
          alert(`No ${filterText} found within 5km of your location. Try changing the filter or expanding your search area.`);
          return;
        }

        // Add markers for nearby stations with distance info
        nearbyStations.forEach((loc) => {
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

          markerClusterGroup.addLayer(marker);
          markers.push(marker);
        });

        map.addLayer(markerClusterGroup);
        findUserLocation();

        // Automatically open all nearby station popups with delay
        setTimeout(() => {
          nearbyStations.forEach((loc, index) => {
            const marker = markers.find(m => {
              const markerPos = m.getLatLng();
              return Math.abs(markerPos.lat - loc.latitude) < 0.0001 &&
                Math.abs(markerPos.lng - loc.longitude) < 0.0001;
            });

            if (marker) {
              setTimeout(() => {
                marker.openPopup();
              }, index * 200);
            }
          });
        }, 1000);

        // Log results with filter information
        const filterText = currentFilter === "All" ? "all types" : currentFilter;
        console.log(`Found ${nearbyStations.length} ${filterText} stations within 5km. Popups opened automatically.`);
      },
      function (error) {
        alert("Unable to get location for nearby search. Please allow location access.");
        console.error("Geolocation error:", error);
      }
    );
  }

  // Calculate distance between two coordinates using Haversine formula
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Remove all markers from the map
  function clearMarkers() {
    markerClusterGroup.clearLayers();
    markers = [];
  }

  // ========================================
  // ROUTE MANAGEMENT FUNCTIONS
  // ========================================
  // Clear all routes and route-related elements from the map
  function clearRoutes() {
    // Remove route control if exists
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }

    // Remove current route line if exists
    if (currentRouteLine) {
      map.removeLayer(currentRouteLine);
      currentRouteLine = null;
    }

    // Remove user location marker if exists
    if (userLocationMarker) {
      map.removeLayer(userLocationMarker);
      userLocationMarker = null;
    }
  }

  // ========================================
  // BUTTON EVENT HANDLERS
  // ========================================
  // Reset map to default view and clear routes
  $("#resetBtn").click(() => {
    clearRoutes(); // Clear any existing routes
    map.setView([10.669644, 122.948844], 17);
    console.log("Reset map to default view.");
  });

  // Clear all markers and routes from map
  $("#clearBtn").click(() => {
    clearMarkers();
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
    console.log("Cleared all markers and routes.");
  });

  // Load markers and clear routes
  $("#postBtn").click(() => {
    clearRoutes(); // Clear routes when loading new markers
    const selected = $("#categorySelect").val();
    loadMarkers(selected);
  });

  // Create route between two user-selected points
  $("#routeBtn").click(() => {
    console.log("Select two points on the map to create a route.");

    map.getContainer().style.cursor = "crosshair";

    let points = [];
    let startMarker = null;
// Initialize global variables for map components
let map;
let routeControl = null;
let userLocationMarker = null;
let currentRouteLine = null;

$(document).ready(function () {
  // Initialize the map centered on default coordinates with zoom level 17
  map = L.map('map').setView([10.669644, 122.948844], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let markers = [];
  let allLocations = [];

  // Create marker cluster group for better performance with many markers
  let markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // Main function to load and display markers on the map
  function loadMarkers(filter = "All", searchTerm = "") {
    $.ajax({
      url: "forms/fetch_location.php",
      type: "GET",
      success: function (response) {
        const res = JSON.parse(response);
        if (res.status === "success") {
          allLocations = res.data;
          clearMarkers();

          // Filter locations based on category and search term
          let filteredLocations = res.data.filter(loc => {
            if (filter !== "All" && loc.category !== filter) return false;
            if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
          });

          filteredLocations.forEach(loc => {
            const { latitude, longitude, category, name, description } = loc;

            // Choose icon based on station category (Gas or EV)
            const iconPath = category === "Gas"
              ? "assets/images/gas.png"
              : "assets/images/EV.png";

            const customIcon = L.icon({
              iconUrl: iconPath,
              iconSize: [38, 38],
              iconAnchor: [19, 38],
              popupAnchor: [0, -36],
            });

            // Create marker with popup containing station info and route button
            const marker = L.marker([latitude, longitude], { icon: customIcon })
              .bindPopup(`<b>${name}</b><br>${category}<br>${description}<br><button onclick="showRealRoute(${latitude}, ${longitude}, '${name.replace(/'/g, "\\'")}')" style="margin-top: 5px; background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Show Route</button>`);

            marker.stationLat = latitude;
            marker.stationLng = longitude;
            marker.stationName = name;
            markerClusterGroup.addLayer(marker);
            markers.push(marker);
          });

          map.addLayer(markerClusterGroup);
        }
      },
      error: () => console.error("Error fetching locations."),
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
  }

  // Get user's current location using browser geolocation API
  function findUserLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Remove existing user location marker if present
        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }

        // Add red marker for user's location
        userLocationMarker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }).addTo(map).bindPopup("Your Location").openPopup();

        // Center map on user's location
        map.setView([lat, lng], 15);
        console.log(`Location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      function (error) {
        // Handle geolocation errors
        let errorMsg = "Unable to get location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Position unavailable. Please check your GPS settings.";
            break;
          case error.TIMEOUT:
            errorMsg += "Request timeout. Please try again.";
            break;
          default:
            errorMsg += "Unknown error occurred.";
            break;
        }
        alert(errorMsg);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Find and display stations within 5km of user's location
  function findNearbyStations() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (allLocations.length === 0) {
          alert("No stations loaded. Please load stations first by clicking 'Show All Stations'.");
          return;
        }

        // Get current filter selection
        const currentFilter = $("#categorySelect").val();

        // Calculate distance for each station and sort by distance
        const stationsWithDistance = allLocations.map(station => {
          const distance = calculateDistance(userLat, userLng, station.latitude, station.longitude);
          return { ...station, distance };
        }).sort((a, b) => a.distance - b.distance);

        // Filter stations within 5km radius AND by category filter
        const nearbyStations = stationsWithDistance.filter(station => {
          // Check distance (within 5km)
          if (station.distance > 5) return false;

          // Check category filter
          if (currentFilter !== "All" && station.category !== currentFilter) return false;

          return true;
        });

        clearMarkers();

        // Check if any stations were found
        if (nearbyStations.length === 0) {
          const filterText = currentFilter === "All" ? "stations" : `${currentFilter} stations`;
          alert(`No ${filterText} found within 5km of your location. Try changing the filter or expanding your search area.`);
          return;
        }

        // Add markers for nearby stations with distance info
        nearbyStations.forEach((loc) => {
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

          markerClusterGroup.addLayer(marker);
          markers.push(marker);
        });

        map.addLayer(markerClusterGroup);
        findUserLocation();

        // Automatically open all nearby station popups with delay
        setTimeout(() => {
          nearbyStations.forEach((loc, index) => {
            const marker = markers.find(m => {
              const markerPos = m.getLatLng();
              return Math.abs(markerPos.lat - loc.latitude) < 0.0001 &&
                Math.abs(markerPos.lng - loc.longitude) < 0.0001;
            });

            if (marker) {
              setTimeout(() => {
                marker.openPopup();
              }, index * 200);
            }
          });
        }, 1000);

        // Log results with filter information
        const filterText = currentFilter === "All" ? "all types" : currentFilter;
        console.log(`Found ${nearbyStations.length} ${filterText} stations within 5km. Popups opened automatically.`);
      },
      function (error) {
        alert("Unable to get location for nearby search. Please allow location access.");
        console.error("Geolocation error:", error);
      }
    );
  }

  // Calculate distance between two coordinates using Haversine formula
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Remove all markers from the map
  function clearMarkers() {
    markerClusterGroup.clearLayers();
    markers = [];
  }

  // ========================================
  // ROUTE MANAGEMENT FUNCTIONS
  // ========================================
  // Clear all routes and route-related elements from the map
  function clearRoutes() {
    // Remove route control if exists
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }

    // Remove current route line if exists
    if (currentRouteLine) {
      map.removeLayer(currentRouteLine);
      currentRouteLine = null;
    }

    // Remove user location marker if exists
    if (userLocationMarker) {
      map.removeLayer(userLocationMarker);
      userLocationMarker = null;
    }
  }

  // ========================================
  // BUTTON EVENT HANDLERS
  // ========================================
  // Reset map to default view and clear routes
  $("#resetBtn").click(() => {
    clearRoutes(); // Clear any existing routes
    map.setView([10.669644, 122.948844], 17);
    console.log("Reset map to default view.");
  });

  // Clear all markers and routes from map
  $("#clearBtn").click(() => {
    clearMarkers();
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
    console.log("Cleared all markers and routes.");
  });

  // Load markers and clear routes
  $("#postBtn").click(() => {
    clearRoutes(); // Clear routes when loading new markers
    const selected = $("#categorySelect").val();
    loadMarkers(selected);
  });

  // Create route between two user-selected points
  $("#routeBtn").click(() => {
    console.log("Select two points on the map to create a route.");

    map.getContainer().style.cursor = "crosshair";

    let points = [];
    let startMarker = null;

    // Wait for first click startpoint
    map.once("click", function (e1) {
      points.push(e1.latlng);

      startMarker = L.marker(e1.latlng, {
        icon: L.icon({
          iconUrl: 'assets/images/s.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      }).addTo(map).bindPopup("Start Point").openPopup();

      console.log("Start point selected. Click destination point.");

      // Wait for second click endpoint
      map.once("click", function (e2) {
        points.push(e2.latlng);

        const endMarker = L.marker(e2.latlng, {
          icon: L.icon({
            iconUrl: 'assets/images/e.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }).addTo(map).bindPopup("End Point").openPopup();

        map.getContainer().style.cursor = "";

        // Remove existing route if present
        if (routeControl) {
          map.removeControl(routeControl);
        }

        console.log("Creating route...");

        // Create routing control using OSRM service
        routeControl = L.Routing.control({
          waypoints: [points[0], points[1]],
          createMarker: () => null,
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

        // Handle successful route calculation
        routeControl.on('routesfound', function (e) {
          const routes = e.routes;
          const summary = routes[0].summary;
          const distance = (summary.totalDistance / 1000).toFixed(2);
          const time = Math.round(summary.totalTime / 60);

          const routeBounds = L.latLngBounds([points[0], points[1]]);
          map.fitBounds(routeBounds, { padding: [50, 50] });

          console.log(`Route: ${distance} km, ${time} min. Map zoomed to fit route.`);

          // Remove start/end markers after 3 seconds
          setTimeout(() => {
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
          }, 3000);
        });

        // Handle routing errors
        routeControl.on('routingerror', function (e) {
          alert("Error creating route. Please try different points.");
          console.error("Routing error:", e);
          map.getContainer().style.cursor = "";
          if (startMarker) map.removeLayer(startMarker);
          if (endMarker) map.removeLayer(endMarker);
        });
      });
    });
  });

  // Filter stations by category and clear routes
  $("#categorySelect").change(() => {
    clearRoutes(); // Clear routes when filtering
    const selected = $("#categorySelect").val();
    const searchTerm = $("#searchInput").val().trim();
    loadMarkers(selected, searchTerm);
  });

  // Search stations and clear routes
  $("#searchBtn").click(() => {
    clearRoutes(); // Clear routes when searching
    searchStations();
  });

  $("#searchInput").keypress(function (e) {
    if (e.which === 13) {
      searchStations();
    }
  });

  // Clear search and routes when input is empty
  $("#searchInput").on('input', function () {
    if ($(this).val().trim() === "") {
      clearRoutes(); // Clear routes when clearing search
      const currentFilter = $("#categorySelect").val();
      loadMarkers(currentFilter);
    }
  });

  // Find user location and clear existing routes
  $("#findMeBtn").click(() => {
    clearRoutes(); // Clear routes before finding location
    findUserLocation();
  });

  // Find nearby stations and clear existing routes
  $("#nearbyBtn").click(() => {
    clearRoutes(); // Clear routes before finding nearby stations
    findNearbyStations();
  });

  // Load all markers on page load
  loadMarkers();
});

window.testRoute = function (lat, lng, name) {
  console.log("testRoute called with:", lat, lng, name);
  alert(`Testing route to ${name} at ${lat}, ${lng}`);

  const testLine = L.polyline([
    [10.669644, 122.948844],
    [lat, lng]
  ], {
    color: 'black',
    weight: 3,
    opacity: 1
  }).addTo(map);

  map.fitBounds(testLine.getBounds(), { padding: [20, 20] });
  console.log(`Test route to ${name} created!`);
};

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

      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
      }

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: 'assets/images/ev.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      currentRouteLine = L.polyline([
        [userLat, userLng],
        [stationLat, stationLng]
      ], {
        color: '#2563eb',
        weight: 6,
        opacity: 0.8
      }).addTo(map);

      const bounds = L.latLngBounds([
        [userLat, userLng],
        [stationLat, stationLng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
      console.log(`Route to ${stationName}: ${distance.toFixed(2)} km. Line drawn and zoomed.`);
    },
    function (error) {
      console.error("Location error:", error);
      alert("Could not get your location. Please allow location access.");
    }
  );
};

// Main function: Creates detailed routing from user location to selected station
window.showRealRoute = function (stationLat, stationLng, stationName) {
  console.log("showRealRoute called with:", stationLat, stationLng, stationName);

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  console.log("Requesting geolocation...");

  // Get user's current location
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log("SUCCESS: Got location!", position);
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      console.log("User location:", userLat, userLng);
      console.log("Station location:", stationLat, stationLng);

      // Clean up existing routes and markers
      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      // Add marker for user's location
      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: 'assets/images/q.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      if (routeControl) {
        map.removeControl(routeControl);
      }

      // Create routing control with OSRM for turn-by-turn directions
      routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(stationLat, stationLng)
        ],
        createMarker: () => null,
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

      // Process and display route with turn-by-turn directions
      routeControl.on('routesfound', function (e) {
        console.log("Route found with directions!", e);
        const routes = e.routes;
        const route = routes[0];
        const summary = route.summary;
        const instructions = route.instructions;

        const totalDistance = (summary.totalDistance / 1000).toFixed(1);
        const totalTime = Math.round(summary.totalTime / 60);

        // Build directions text from route instructions
        let directionsText = `${stationName}\n`;
        directionsText += `${totalDistance} km, ${totalTime} min\n\n`;

        instructions.forEach((instruction, index) => {
          const distance = instruction.distance;
          let distanceText = '';

          // Format distance as km or m
          if (distance >= 1000) {
            distanceText = `${(distance / 1000).toFixed(1)} km`;
          } else {
            distanceText = `${Math.round(distance)} m`;
          }

          let text = instruction.text || instruction.instruction || 'Continue';

          if (index < instructions.length - 1) {
            directionsText += `${text} ${distanceText}\n`;
          } else {
            directionsText += `${text}\n`;
          }
        });

        // Fit map to show entire route
        map.fitBounds(route.bounds || [[userLat, userLng], [stationLat, stationLng]], { padding: [50, 50] });
        console.log("Detailed directions:", directionsText);
      });

      routeControl.on('routingerror', function (e) {
        console.error("Routing error, using simple line:", e);

        if (routeControl) {
          map.removeControl(routeControl);
          routeControl = null;
        }

        currentRouteLine = L.polyline([
          [userLat, userLng],
          [stationLat, stationLng]
        ], {
          color: '#2563eb',
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 10'
        }).addTo(map);

        const bounds = L.latLngBounds([
          [userLat, userLng],
          [stationLat, stationLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
        console.log(`Fallback route: ${distance.toFixed(1)} km direct line`);
      });
    },
    function (error) {
      // Handle geolocation errors 
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
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
};
    // Wait for first click startpoint
    map.once("click", function (e1) {
      points.push(e1.latlng);

      startMarker = L.marker(e1.latlng, {
        icon: L.icon({
          iconUrl: 'assets/images/s.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      }).addTo(map).bindPopup("Start Point").openPopup();

      console.log("Start point selected. Click destination point.");

      // Wait for second click endpoint
      map.once("click", function (e2) {
        points.push(e2.latlng);

        const endMarker = L.marker(e2.latlng, {
          icon: L.icon({
            iconUrl: 'assets/images/e.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }).addTo(map).bindPopup("End Point").openPopup();

        map.getContainer().style.cursor = "";

        // Remove existing route if present
        if (routeControl) {
          map.removeControl(routeControl);
        }

        console.log("Creating route...");

        // Create routing control using OSRM service
        routeControl = L.Routing.control({
          waypoints: [points[0], points[1]],
          createMarker: () => null,
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

        // Handle successful route calculation
        routeControl.on('routesfound', function (e) {
          const routes = e.routes;
          const summary = routes[0].summary;
          const distance = (summary.totalDistance / 1000).toFixed(2);
          const time = Math.round(summary.totalTime / 60);

          const routeBounds = L.latLngBounds([points[0], points[1]]);
          map.fitBounds(routeBounds, { padding: [50, 50] });

          console.log(`Route: ${distance} km, ${time} min. Map zoomed to fit route.`);

          // Remove start/end markers after 3 seconds
          setTimeout(() => {
            if (startMarker) map.removeLayer(startMarker);
            if (endMarker) map.removeLayer(endMarker);
          }, 3000);
        });

        // Handle routing errors
        routeControl.on('routingerror', function (e) {
          alert("Error creating route. Please try different points.");
          console.error("Routing error:", e);
          map.getContainer().style.cursor = "";
          if (startMarker) map.removeLayer(startMarker);
          if (endMarker) map.removeLayer(endMarker);
        });
      });
    });
  });

  // Filter stations by category and clear routes
  $("#categorySelect").change(() => {
    clearRoutes(); // Clear routes when filtering
    const selected = $("#categorySelect").val();
    const searchTerm = $("#searchInput").val().trim();
    loadMarkers(selected, searchTerm);
  });

  // Search stations and clear routes
  $("#searchBtn").click(() => {
    clearRoutes(); // Clear routes when searching
    searchStations();
  });

  $("#searchInput").keypress(function (e) {
    if (e.which === 13) {
      searchStations();
    }
  });

  // Clear search and routes when input is empty
  $("#searchInput").on('input', function () {
    if ($(this).val().trim() === "") {
      clearRoutes(); // Clear routes when clearing search
      const currentFilter = $("#categorySelect").val();
      loadMarkers(currentFilter);
    }
  });

  // Find user location and clear existing routes
  $("#findMeBtn").click(() => {
    clearRoutes(); // Clear routes before finding location
    findUserLocation();
  });

  // Find nearby stations and clear existing routes
  $("#nearbyBtn").click(() => {
    clearRoutes(); // Clear routes before finding nearby stations
    findNearbyStations();
  });

  // Load all markers on page load
  loadMarkers();
});

window.testRoute = function (lat, lng, name) {
  console.log("testRoute called with:", lat, lng, name);
  alert(`Testing route to ${name} at ${lat}, ${lng}`);

  const testLine = L.polyline([
    [10.669644, 122.948844],
    [lat, lng]
  ], {
    color: 'black',
    weight: 3,
    opacity: 1
  }).addTo(map);

  map.fitBounds(testLine.getBounds(), { padding: [20, 20] });
  console.log(`Test route to ${name} created!`);
};

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

      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
      }

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: 'assets/images/ev.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      currentRouteLine = L.polyline([
        [userLat, userLng],
        [stationLat, stationLng]
      ], {
        color: '#2563eb',
        weight: 6,
        opacity: 0.8
      }).addTo(map);

      const bounds = L.latLngBounds([
        [userLat, userLng],
        [stationLat, stationLng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
      console.log(`Route to ${stationName}: ${distance.toFixed(2)} km. Line drawn and zoomed.`);
    },
    function (error) {
      console.error("Location error:", error);
      alert("Could not get your location. Please allow location access.");
    }
  );
};

// Main function: Creates detailed routing from user location to selected station
window.showRealRoute = function (stationLat, stationLng, stationName) {
  console.log("showRealRoute called with:", stationLat, stationLng, stationName);

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  console.log("Requesting geolocation...");

  // Get user's current location
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log("SUCCESS: Got location!", position);
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      console.log("User location:", userLat, userLng);
      console.log("Station location:", stationLat, stationLng);

      // Clean up existing routes and markers
      if (currentRouteLine) {
        map.removeLayer(currentRouteLine);
      }

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      // Add marker for user's location
      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: 'assets/images/q.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      if (routeControl) {
        map.removeControl(routeControl);
      }

      // Create routing control with OSRM for turn-by-turn directions
      routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(stationLat, stationLng)
        ],
        createMarker: () => null,
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

      // Process and display route with turn-by-turn directions
      routeControl.on('routesfound', function (e) {
        console.log("Route found with directions!", e);
        const routes = e.routes;
        const route = routes[0];
        const summary = route.summary;
        const instructions = route.instructions;

        const totalDistance = (summary.totalDistance / 1000).toFixed(1);
        const totalTime = Math.round(summary.totalTime / 60);

        // Build directions text from route instructions
        let directionsText = `${stationName}\n`;
        directionsText += `${totalDistance} km, ${totalTime} min\n\n`;

        instructions.forEach((instruction, index) => {
          const distance = instruction.distance;
          let distanceText = '';

          // Format distance as km or m
          if (distance >= 1000) {
            distanceText = `${(distance / 1000).toFixed(1)} km`;
          } else {
            distanceText = `${Math.round(distance)} m`;
          }

          let text = instruction.text || instruction.instruction || 'Continue';

          if (index < instructions.length - 1) {
            directionsText += `${text} ${distanceText}\n`;
          } else {
            directionsText += `${text}\n`;
          }
        });

        // Fit map to show entire route
        map.fitBounds(route.bounds || [[userLat, userLng], [stationLat, stationLng]], { padding: [50, 50] });
        console.log("Detailed directions:", directionsText);
      });

      // Fallback: If routing fails, draw simple straight line
      routeControl.on('routingerror', function (e) {
        console.error("Routing error, using simple line:", e);

        if (routeControl) {
          map.removeControl(routeControl);
          routeControl = null;
        }

        currentRouteLine = L.polyline([
          [userLat, userLng],
          [stationLat, stationLng]
        ], {
          color: '#2563eb',
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 10'
        }).addTo(map);

        const bounds = L.latLngBounds([
          [userLat, userLng],
          [stationLat, stationLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
        console.log(`Fallback route: ${distance.toFixed(1)} km direct line`);
      });
    },
    function (error) {
      // Handle geolocation errors with detailed messages
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
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
};
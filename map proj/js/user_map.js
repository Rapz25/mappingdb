$(document).ready(function () {
  const map = L.map('map').setView([10.669644, 122.948844], 17);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let markers = [];
  let routeControl = null;
  let allLocations = []; // Store all locations for search
  let userLocationMarker = null; // Store user's location marker

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
          allLocations = res.data; // Store all locations for search
          clearMarkers();
          
          let filteredLocations = res.data.filter(loc => {
            // Apply category filter
            if (filter !== "All" && loc.category !== filter) return false;
            
            // Apply search filter
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
              .addTo(map)
              .bindPopup(`<b>${name}</b><br>${category}<br>${description}`);
            markers.push(marker);
          });
          
          const filterText = filter !== "All" ? filter + " " : "";
          const searchText = searchTerm ? ` matching "${searchTerm}"` : "";
          log(`Loaded ${markers.length} ${filterText}locations${searchText}.`);
        }
      },
      error: () => log("Error fetching locations."),
    });
  }

  // Search functionality
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

  // Geolocation functionality
  function findUserLocation() {
    if (!navigator.geolocation) {
      log("Geolocation is not supported by this browser.");
      return;
    }

    log("Getting your location...");
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Remove previous user location marker
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
        
        // Center map on user location
        map.setView([lat, lng], 15);
        log(`Location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      function(error) {
        let errorMsg = "Unable to get location: ";
        switch(error.code) {
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

  // Find nearby stations
  function findNearbyStations() {
    if (!navigator.geolocation) {
      log("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        if (allLocations.length === 0) {
          log("No stations loaded. Please load stations first.");
          return;
        }
        
        // Calculate distances and sort by proximity
        const stationsWithDistance = allLocations.map(station => {
          const distance = calculateDistance(userLat, userLng, station.latitude, station.longitude);
          return { ...station, distance };
        }).sort((a, b) => a.distance - b.distance);
        
        // Show only nearby stations (within 5km)
        const nearbyStations = stationsWithDistance.filter(station => station.distance <= 5);
        
        clearMarkers();
        
        nearbyStations.forEach(loc => {
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
            .addTo(map)
            .bindPopup(`<b>${name}</b><br>${category}<br>${description}<br><strong>Distance: ${distance.toFixed(2)} km</strong>`);
          markers.push(marker);
        });
        
        // Add user location marker
        findUserLocation();
        
        log(`Found ${nearbyStations.length} stations within 5km of your location.`);
      },
      function(error) {
        log("Unable to get location for nearby search.");
      }
    );
  }

  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
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

    let points = [];
    map.once("click", function (e1) {
      points.push(e1.latlng);
      map.once("click", function (e2) {
        points.push(e2.latlng);
        if (routeControl) map.removeControl(routeControl);

        routeControl = L.Routing.control({
          waypoints: [points[0], points[1]],
          createMarker: () => null,
          draggableWaypoints: false,
          routeWhileDragging: false,
        }).addTo(map);

        log("Route created successfully.");
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

  $("#searchInput").keypress(function(e) {
    if (e.which === 13) { // Enter key
      searchStations();
    }
  });

  // Clear search when input is empty
  $("#searchInput").on('input', function() {
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

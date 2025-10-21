let map;
let routeControl = null;
let userLocationMarker = null;
let currentRouteLine = null;
let markers = [];
let allLocations = [];
let markerClusterGroup;

// Configuration settings
const CONFIG = {
  defaultCenter: [10.669644, 122.948844],
  defaultZoom: 17,
  nearbyRadius: 5, // kilometers
  icons: {
    gas: "assets/images/gas.png",
    ev: "assets/images/EV.png",
    userLocation: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    startPoint: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
  }
};

$(document).ready(function () {
  initializeMap();
  setupEventHandlers();
  loadAllStations();
});

// MAP INITIALIZATIO

function initializeMap() {
  // Create the map
  map = L.map('map').setView(CONFIG.defaultCenter, CONFIG.defaultZoom);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Setup marker clustering for better performance
  markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });
}

function loadAllStations() {
  $.ajax({
    url: "forms/fetch_location.php",
    type: "GET",
    success: function (response) {
      try {
        const result = JSON.parse(response);
        if (result.status === "success") {
          allLocations = result.data;
          displayStations(allLocations);
        } else {
          console.error("Error loading stations:", result.message);
        }
      } catch (error) {
        console.error("Error parsing station data:", error);
      }
    },
    error: function () {
      console.error("Failed to fetch station data");
      alert("Error loading station data. Please refresh the page.");
    }
  });
}

function filterStations(filter = "All", searchTerm = "") {
  let filteredStations = allLocations;

  // Filter by category
  if (filter !== "All") {
    filteredStations = filteredStations.filter(station => station.category === filter);
  }

  // Filter by search term
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredStations = filteredStations.filter(station =>
      station.name.toLowerCase().includes(searchLower)
    );
  }

  return filteredStations;
}

function displayStations(stations) {
  clearAllMarkers();

  if (stations.length === 0) {
    console.log("No stations to display");
    return;
  }

  // Create markers for each station
  stations.forEach(station => {
    const marker = createStationMarker(station);
    markerClusterGroup.addLayer(marker);
    markers.push(marker);
  });

  // Add markers to map
  map.addLayer(markerClusterGroup);
}

function createStationMarker(station) {
  const { latitude, longitude, category, name, description } = station;

  // Choose icon based on station type
  const iconUrl = category === "Gas" ? CONFIG.icons.gas : CONFIG.icons.ev;

  const customIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36]
  });

  // Create marker
  const marker = L.marker([latitude, longitude], { icon: customIcon });

  // Create popup content
  let popupContent = `<b>${name}</b><br>${category}<br>${description}`;

  // Add distance if available
  if (station.distance) {
    popupContent += `<br><strong>Distance: ${station.distance.toFixed(2)} km</strong>`;
  }

  // Add route button
  const safeName = name.replace(/'/g, "\\'");
  popupContent += `<br><button onclick="showRouteToStation(${latitude}, ${longitude}, '${safeName}')" 
                   style="margin-top: 5px; background: #2563eb; color: white; border: none; 
                   padding: 5px 10px; border-radius: 3px; cursor: pointer;">Show Route</button>`;

  marker.bindPopup(popupContent);

  // Store station info on marker
  marker.stationData = station;

  return marker;
}

// GEOLOCATION

function findUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Remove existing user marker
      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      // Add user location marker
      userLocationMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: CONFIG.icons.userLocation,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      // Center map on user location
      map.setView([lat, lng], 15);
      console.log(`User location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    },
    function (error) {
      handleLocationError(error);
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
    alert("Geolocation is not supported by this browser.");
    return;
  }

  if (allLocations.length === 0) {
    alert("No stations loaded. Please wait for stations to load first.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const currentFilter = $("#categorySelect").val();

      // Calculate distances and find nearby stations
      const stationsWithDistance = allLocations.map(station => {
        const distance = calculateDistance(userLat, userLng, station.latitude, station.longitude);
        return { ...station, distance: distance };
      });

      // Filter by distance and category
      let nearbyStations = stationsWithDistance.filter(station => {
        if (station.distance > CONFIG.nearbyRadius) return false;
        if (currentFilter !== "All" && station.category !== currentFilter) return false;
        return true;
      });

      // Sort by distance
      nearbyStations.sort((a, b) => a.distance - b.distance);

      if (nearbyStations.length === 0) {
        const filterText = currentFilter === "All" ? "stations" : `${currentFilter} stations`;
        alert(`No ${filterText} found within ${CONFIG.nearbyRadius}km of your location.`);
        return;
      }

      // Display nearby stations
      displayStations(nearbyStations);

      // Show user location
      findUserLocation();



      console.log(`Found ${nearbyStations.length} stations within ${CONFIG.nearbyRadius}km`);
    },
    function (error) {
      handleLocationError(error);
    }
  );
}

function handleLocationError(error) {
  let errorMessage = "Unable to get your location: ";

  switch (error.code) {
    case error.PERMISSION_DENIED:
      errorMessage += "Permission denied. Please allow location access.";
      break;
    case error.POSITION_UNAVAILABLE:
      errorMessage += "Position unavailable. Please check your GPS settings.";
      break;
    case error.TIMEOUT:
      errorMessage += "Request timeout. Please try again.";
      break;
    default:
      errorMessage += "Unknown error occurred.";
      break;
  }

  alert(errorMessage);
  console.error("Geolocation error:", error);
}


//UTILITY 


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

function findMarkerByLocation(lat, lng) {
  return markers.find(marker => {
    const markerPos = marker.getLatLng();
    return Math.abs(markerPos.lat - lat) < 0.0001 &&
      Math.abs(markerPos.lng - lng) < 0.0001;
  });
}

function clearAllMarkers() {
  markerClusterGroup.clearLayers();
  markers = [];
}

function clearAllRoutes() {
  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }

  if (currentRouteLine) {
    map.removeLayer(currentRouteLine);
    currentRouteLine = null;
  }

  if (userLocationMarker) {
    map.removeLayer(userLocationMarker);
    userLocationMarker = null;
  }
}

function resetMapView() {
  map.setView(CONFIG.defaultCenter, CONFIG.defaultZoom);
}

// ========================================
// SEARCH FUNCTIONALITY WITH SUGGESTIONS
// ========================================

function performSearch() {
  const searchTerm = $("#searchInput").val().trim();
  const currentFilter = $("#categorySelect").val();

  const filteredStations = filterStations(currentFilter, searchTerm);
  displayStations(filteredStations);

  // Hide suggestions when search is performed
  hideSuggestions();

  if (filteredStations.length === 0) {
    alert("No stations found matching your search criteria.");
  }
}

function showSearchSuggestions(searchTerm) {
  const suggestionsContainer = $("#searchSuggestions");

  if (!searchTerm || searchTerm.length < 2) {
    hideSuggestions();
    return;
  }

  const currentFilter = $("#categorySelect").val();
  const matchingStations = filterStations(currentFilter, searchTerm);

  // Limit to top 5 suggestions
  const suggestions = matchingStations.slice(0, 5);

  if (suggestions.length === 0) {
    suggestionsContainer.html('<div class="no-suggestions">No matching stations found</div>');
    suggestionsContainer.show();
    return;
  }

  let suggestionsHtml = '';
  suggestions.forEach(station => {
    const distance = station.distance ? ` • ${station.distance.toFixed(1)}km` : '';
    suggestionsHtml += `
      <div class="suggestion-item" data-lat="${station.latitude}" data-lng="${station.longitude}" data-name="${station.name}">
        <div class="suggestion-name">${highlightMatch(station.name, searchTerm)}</div>
        <div class="suggestion-details">${station.category}${distance}</div>
      </div>
    `;
  });

  suggestionsContainer.html(suggestionsHtml);
  suggestionsContainer.show();
}

function highlightMatch(text, searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

function hideSuggestions() {
  $("#searchSuggestions").hide();
}

function selectSuggestion(stationName, lat, lng) {
  $("#searchInput").val(stationName);
  hideSuggestions();

  // Find and highlight the selected station
  const station = allLocations.find(s => s.latitude == lat && s.longitude == lng);
  if (station) {
    displayStations([station]);

    // Center map on selected station
    map.setView([lat, lng], 16);

    // Find and open the marker popup
    setTimeout(() => {
      const marker = findMarkerByLocation(lat, lng);
      if (marker) {
        marker.openPopup();
      }
    }, 500);
  }
}

// ROUTING 

function showRouteToStation(stationLat, stationLng, stationName) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      clearAllRoutes();

      // Add user location marker
      userLocationMarker = L.marker([userLat, userLng], {
        icon: L.icon({
          iconUrl: CONFIG.icons.userLocation,
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("Your Location").openPopup();

      // Create route
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

      // Handle successful route
      routeControl.on('routesfound', function (e) {
        const route = e.routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(1);
        const time = Math.round(route.summary.totalTime / 60);

        map.fitBounds(route.bounds || [[userLat, userLng], [stationLat, stationLng]], { padding: [50, 50] });
        console.log(`Route to ${stationName}: ${distance}km, ${time} minutes`);
      });

      // Handle routing errors
      routeControl.on('routingerror', function (e) {
        console.error("Routing failed, using direct line:", e);
        createDirectRoute(userLat, userLng, stationLat, stationLng, stationName);
      });
    },
    function (error) {
      handleLocationError(error);
    }
  );
}

function createDirectRoute(userLat, userLng, stationLat, stationLng, stationName) {
  // Remove failed route control
  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }

  // Create direct line
  currentRouteLine = L.polyline([
    [userLat, userLng],
    [stationLat, stationLng]
  ], {
    color: '#2563eb',
    weight: 6,
    opacity: 0.8,
    dashArray: '10, 10'
  }).addTo(map);

  // Fit map to show route
  const bounds = L.latLngBounds([[userLat, userLng], [stationLat, stationLng]]);
  map.fitBounds(bounds, { padding: [50, 50] });

  const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
  console.log(`Direct route to ${stationName}: ${distance.toFixed(1)}km`);
}

function createCustomRoute() {
  map.getContainer().style.cursor = "crosshair";
  let points = [];
  let startMarker = null;

  // First click - start point
  map.once("click", function (e1) {
    points.push(e1.latlng);

    startMarker = L.marker(e1.latlng, {
      icon: L.icon({
        iconUrl: CONFIG.icons.startPoint,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      })
    }).addTo(map).bindPopup("Start Point").openPopup();

    // Second click - end point
    map.once("click", function (e2) {
      points.push(e2.latlng);

      const endMarker = L.marker(e2.latlng, {
        icon: L.icon({
          iconUrl: CONFIG.icons.userLocation,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })
      }).addTo(map).bindPopup("End Point").openPopup();

      map.getContainer().style.cursor = "";

      // Create route between points
      if (routeControl) {
        map.removeControl(routeControl);
      }

      routeControl = L.Routing.control({
        waypoints: points,
        createMarker: () => null,
        draggableWaypoints: false,
        routeWhileDragging: false,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }]
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
      }).addTo(map);

      routeControl.on('routesfound', function (e) {
        const route = e.routes[0];
        const distance = (route.summary.totalDistance / 1000).toFixed(2);
        const time = Math.round(route.summary.totalTime / 60);

        map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
        console.log(`Custom route: ${distance}km, ${time} minutes`);

        // Remove temporary markers after 3 seconds
        setTimeout(() => {
          if (startMarker) map.removeLayer(startMarker);
          if (endMarker) map.removeLayer(endMarker);
        }, 3000);
      });

      routeControl.on('routingerror', function () {
        alert("Error creating route. Please try different points.");
        map.getContainer().style.cursor = "";
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker) map.removeLayer(endMarker);
      });
    });
  });
}


function setupEventHandlers() {
  $("#resetBtn").click(function () {
    clearAllRoutes();
    resetMapView();
    console.log("Map reset to default view");
  });

  $("#clearBtn").click(function () {
    clearAllMarkers();
    clearAllRoutes();
    console.log("Cleared all markers and routes");
  });

  $("#postBtn").click(function () {
    clearAllRoutes();
    const selectedFilter = $("#categorySelect").val();
    const filteredStations = filterStations(selectedFilter);
    displayStations(filteredStations);
  });

  $("#findMeBtn").click(function () {
    clearAllRoutes();
    findUserLocation();
  });

  $("#nearbyBtn").click(function () {
    clearAllRoutes();
    findNearbyStations();
  });

  $("#routeBtn").click(function () {
    console.log("Click two points on the map to create a route");
    createCustomRoute();
  });

  $("#searchBtn").click(function () {
    clearAllRoutes();
    performSearch();
  });

  $("#searchInput").keypress(function (e) {
    if (e.which === 13) { // Enter key
      clearAllRoutes();
      performSearch();
    }
  });

  // Search input with suggestions
  $("#searchInput").on('input', function () {
    const searchTerm = $(this).val().trim();

    if (searchTerm === "") {
      hideSuggestions();
      clearAllRoutes();
      const currentFilter = $("#categorySelect").val();
      const filteredStations = filterStations(currentFilter);
      displayStations(filteredStations);
    } else {
      showSearchSuggestions(searchTerm);
    }
  });

  // Handle suggestion clicks
  $(document).on('click', '.suggestion-item', function () {
    const stationName = $(this).data('name');
    const lat = $(this).data('lat');
    const lng = $(this).data('lng');
    selectSuggestion(stationName, lat, lng);
  });

  // Hide suggestions when clicking outside
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.search-container').length) {
      hideSuggestions();
    }
  });

  $("#searchInput").keydown(function (e) {
    const suggestions = $('.suggestion-item');
    const highlighted = $('.suggestion-item.highlighted');

    if (e.which === 40) { 
      e.preventDefault();
      if (highlighted.length === 0) {
        suggestions.first().addClass('highlighted');
      } else {
        highlighted.removeClass('highlighted');
        const next = highlighted.next('.suggestion-item');
        if (next.length > 0) {
          next.addClass('highlighted');
        } else {
          suggestions.first().addClass('highlighted');
        }
      }
    } else if (e.which === 38) { 
      e.preventDefault();
      if (highlighted.length === 0) {
        suggestions.last().addClass('highlighted');
      } else {
        highlighted.removeClass('highlighted');
        const prev = highlighted.prev('.suggestion-item');
        if (prev.length > 0) {
          prev.addClass('highlighted');
        } else {
          suggestions.last().addClass('highlighted');
        }
      }
    } else if (e.which === 13 && highlighted.length > 0) {
      e.preventDefault();
      const stationName = highlighted.data('name');
      const lat = highlighted.data('lat');
      const lng = highlighted.data('lng');
      selectSuggestion(stationName, lat, lng);
    } else if (e.which === 27) {
      hideSuggestions();
    }
  });

  $("#categorySelect").change(function () {
    clearAllRoutes();
    const selectedFilter = $(this).val();
    const searchTerm = $("#searchInput").val().trim();
    const filteredStations = filterStations(selectedFilter, searchTerm);
    displayStations(filteredStations);
  });
}

// Make function available globally for popup buttons
window.showRouteToStation = showRouteToStation;

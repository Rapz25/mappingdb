$(document).ready(function () {
    var map = L.map('map').setView([10.669644, 122.948844], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    var tempMarker = null;

    function clearForm() {
        $("#lat").val('');
        $("#lng").val('');
        $("#category").val('');
    }

    var customControl = L.control({ position: 'topright' });
    customControl.onAdd = function () {
        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        L.DomEvent.disableClickPropagation(div);

        var resetBtn = L.DomUtil.create('button', '', div);
        resetBtn.innerHTML = "Reset Zoom";
        resetBtn.style.display = "block";
        resetBtn.style.width = "100%";
        resetBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e); 
            map.setView([10.669644, 122.948844], 17);
        };

        var plotBtn = L.DomUtil.create('button', '', div);
        plotBtn.innerHTML = "Plot";
        plotBtn.style.display = "block";
        plotBtn.style.width = "100%";
        plotBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e); 
            clearForm(); 
            $("#plotForm").show();
        };

        return div;
    };

    customControl.addTo(map);

    $("#newBtn").click(function (e) {
        e.stopPropagation();
        clearForm();

        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });

    $("#closeForm").click(function (e) {
        e.stopPropagation();
        $("#plotForm").hide();

        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });

    map.on("movestart", function () {
        if ($("#plotForm").is(":visible")) {
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
            $("#plotForm").hide();
        }
    });

    map.on("click", function (e) {
        if ($(e.originalEvent.target).closest("#plotForm, .leaflet-control").length > 0) {
            return;
        }

        var lat = e.latlng.lat.toFixed(6);
        var lng = e.latlng.lng.toFixed(6);

        if (tempMarker) {
            map.removeLayer(tempMarker);
        }

        tempMarker = L.marker([lat, lng]).addTo(map);

        clearForm();
        $("#plotForm").show();
        $("#lat").val(lat);
        $("#lng").val(lng);
    });

    $("#saveBtn").click(function (e) {

    });
});

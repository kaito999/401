// script.js
const locationInput = document.getElementById("locationInput");
const addLocationButton = document.getElementById("addLocationButton");
const clearLocationsButton = document.getElementById("clearLocationsButton");
const locationsList = document.getElementById("locationsList");

let locationsArray = [];
let map;
let markers = [];

addLocationButton.addEventListener("click", addLocation);
clearLocationsButton.addEventListener("click", clearAllLocations);

async function addLocation() {
    const location = locationInput.value.trim().toLowerCase();

    if (location !== "") {
        if (!locationsArray.includes(location)) {
            const coordinates = await getCoordinatesForLocation(location);
            if (coordinates) {
                locationsArray.push({ name: location, coords: coordinates });
                updateLocationsList();
                updateMap();
                locationInput.value = "";
            } else {
                alert("Location not found. Please try another search.");
            }
        } else {
            alert("Location already added.");
        }
    } else {
        alert("Please enter a valid location.");
    }
}

function updateLocationsList() {
    locationsList.innerHTML = "";
    locationsArray.forEach((location) => {
        const li = document.createElement("li");
        li.textContent =
            location.name.charAt(0).toUpperCase() + location.name.slice(1);
        locationsList.appendChild(li);
    });
}

function updateMap() {
    if (!map) {
        map = L.map("map").setView([20, 0], 2); // Global view
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);
    }

    clearMarkers();

    locationsArray.forEach((location) => {
        const marker = L.marker(location.coords)
            .addTo(map)
            .bindPopup(
                location.name.charAt(0).toUpperCase() + location.name.slice(1)
            );
        markers.push(marker);
    });

    if (locationsArray.length > 0) {
        const lastLocation = locationsArray[locationsArray.length - 1];
        map.setView(lastLocation.coords, 6);
    }
}

// Fetch coordinates dynamically for any location
async function getCoordinatesForLocation(location) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                location
            )}&limit=1`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch location data");
        }

        const data = await response.json();

        if (data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching location:", error);
        return null;
    }
}

function clearMarkers() {
    markers.forEach((marker) => {
        map.removeLayer(marker);
    });
    markers = [];
}

function clearAllLocations() {
    locationsArray = [];
    clearMarkers();
    updateLocationsList();

    if (map) {
        map.setView([20, 0], 2);
    }
}

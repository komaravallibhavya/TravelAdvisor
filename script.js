mapboxgl.accessToken = 'pk.eyJ1Ijoic3ViaGFtcHJlZXQiLCJhIjoiY2toY2IwejF1MDdodzJxbWRuZHAweDV6aiJ9.Ys8MP5kVTk5P9V2TDvnuDg';

const placesList = document.getElementById('placesList');

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true });

function successLocation(position) {
  setupMap([position.coords.longitude, position.coords.latitude]);
  fetchNearbyPlaces([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
  setupMap([-2.24, 53.48]);
}

function setupMap(center) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: center,
    zoom: 15
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken
  });

  map.addControl(directions, 'top-left');
}

async function fetchNearbyPlaces(center) {
  const types = ['restaurant', 'hotel', 'attraction','school','college']; // Types of nearby places to search for

  placesList.innerHTML = '';

  for (const type of types) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${type}.json?proximity=${center[0]},${center[1]}&types=poi&limit=5&access_token=${mapboxgl.accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features.length > 0) {
      const places = data.features.map(feature => feature.place_name);

      const typeHeader = document.createElement('h3');
      typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      placesList.appendChild(typeHeader);

      places.forEach(place => {
        const li = document.createElement('li');
        li.textContent = place;
        placesList.appendChild(li);
      });
    }
  }
}

function searchPlaces(event) {
  event.preventDefault();
  const searchInput = document.getElementById('searchInput').value;

  // Geocode the search input to get its coordinates
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchInput}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      if (data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        setupMap(coordinates);
        fetchNearbyPlaces(coordinates);
      } else {
        alert('Location not found.');
      }
    })
    .catch(error => {
      console.error('Error fetching location:', error);
    });
}




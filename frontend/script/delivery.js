// Initialize delivery map with Leaflet
// Leaflet is loaded via CDN in delivery.html

(function() {
  'use strict';

  // Store location coordinates (example: Indianapolis, IN)
  var STORE_LOCATION = {
    lat: 39.7684,
    lng: -86.1581,
    name: "Glacy Ice Cream Store"
  };

  // Define delivery zones with coordinates
  var DELIVERY_ZONES = [
    {
      id: 'zone-1',
      name: 'Zone 1 - Downtown & Surrounding',
      color: '#4CAF50',
      radius: 3200,
      deliveryTime: '30-45 min',
      deliveryFee: 'Free $30+',
      center: [39.7684, -86.1581]
    },
    {
      id: 'zone-2',
      name: 'Zone 2 - Extended Area',
      color: '#2196F3',
      radius: 8000,
      deliveryTime: '45-60 min',
      deliveryFee: '$4.99',
      center: [39.7684, -86.1581]
    },
    {
      id: 'zone-3',
      name: 'Zone 3 - Greater Metropolitan',
      color: '#FF9800',
      radius: 16000,
      deliveryTime: '60-90 min',
      deliveryFee: '$7.99',
      center: [39.7684, -86.1581]
    },
    {
      id: 'zone-4',
      name: 'Zone 4 - Extended Metro',
      color: '#F44336',
      radius: 24000,
      deliveryTime: '90-120 min',
      deliveryFee: '$9.99',
      center: [39.7684, -86.1581]
    }
  ];

  var map = null;
  var zoneCircles = [];

  // Initialize the map
  function initMap() {
    var L = window.L;
    if (!L) {
      console.error('Leaflet not loaded');
      return;
    }

    var mapContainer = document.getElementById('delivery-map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    map = L.map('delivery-map').setView([STORE_LOCATION.lat, STORE_LOCATION.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Add store marker
    var storeIcon = L.divIcon({
      className: 'store-marker',
      html: '<div class="store-icon"><i class="fa-solid fa-store"></i></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    L.marker([STORE_LOCATION.lat, STORE_LOCATION.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup('<strong>Glacy Ice Cream Store</strong><br>123 Main Street<br>Indianapolis, IN 46201');

    // Add delivery zone circles
    DELIVERY_ZONES.forEach(function(zone) {
      var circle = L.circle([zone.center[0], zone.center[1]], {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.15,
        radius: zone.radius,
        weight: 2
      }).addTo(map);

      circle.bindPopup(
        '<strong>' + zone.name + '</strong><br>' +
        '<span style="color: ' + zone.color + '">●</span> ' + zone.deliveryTime + '<br>' +
        '<span style="color: ' + zone.color + '">●</span> ' + zone.deliveryFee
      );

      zoneCircles.push(circle);
    });

    // Add click handler to show zone info
    zoneCircles.forEach(function(circle) {
      circle.on('click', function(e) {
        map.setView(e.latlng, 13);
      });
    });

    // Add legend
    addLegend();
  }

  // Add legend to map
  function addLegend() {
    var L = window.L;
    if (!L || !map) return;

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'delivery-legend');
      div.innerHTML = '<h4>Delivery Zones</h4>';

      DELIVERY_ZONES.forEach(function(zone) {
        div.innerHTML +=
          '<div class="legend-item">' +
            '<span class="legend-color" style="background-color: ' + zone.color + '"></span>' +
            '<span class="legend-label">' + zone.name + '</span>' +
          '</div>';
      });

      return div;
    };

    legend.addTo(map);
  }

  // Get user's location
  function getUserLocation() {
    var L = window.L;
    if (!L) {
      if (window.showToast) {
        window.showToast('Map not loaded', 'error');
      }
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          map.setView([latitude, longitude], 13);

          // Add user marker
          var userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div class="user-icon"><i class="fa-solid fa-location-dot"></i></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<strong>Your Location</strong>')
            .openPopup();
        },
        function(error) {
          console.error('Error getting location:', error);
          if (window.showToast) {
            window.showToast('Unable to get your location', 'error');
          }
        }
      );
    } else {
      if (window.showToast) {
        window.showToast('Geolocation not supported', 'error');
      }
    }
  }

  // Calculate delivery fee based on distance
  function calculateDeliveryFee(lat, lng) {
    var distance = map.distance([lat, lng], [STORE_LOCATION.lat, STORE_LOCATION.lng]);
    var distanceMiles = distance * 0.621371; // Convert meters to miles

    if (distanceMiles <= 2) {
      return { fee: 0, zone: 'zone-1', time: '30-45 min' };
    } else if (distanceMiles <= 5) {
      return { fee: 4.99, zone: 'zone-2', time: '45-60 min' };
    } else if (distanceMiles <= 10) {
      return { fee: 7.99, zone: 'zone-3', time: '60-90 min' };
    } else if (distanceMiles <= 15) {
      return { fee: 9.99, zone: 'zone-4', time: '90-120 min' };
    } else {
      return { fee: null, zone: null, time: 'Outside delivery area' };
    }
  }

  // Initialize FAQ accordion
  function initFaq() {
    var questions = document.querySelectorAll('.faq-question');
    questions.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = this.closest('.faq-item');
        if (!item) return;
        var isActive = item.classList.contains('active');
        // Close all
        document.querySelectorAll('.faq-item.active').forEach(function(el) {
          el.classList.remove('active');
        });
        // Open clicked if it wasn't open
        if (!isActive) item.classList.add('active');
      });
    });
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initFaq();

    // Add "Get My Location" button functionality
    var getLocationBtn = document.getElementById('get-location-btn');
    if (getLocationBtn) {
      getLocationBtn.addEventListener('click', getUserLocation);
    }
  });

  // Export functions to window for external use
  window.deliveryMap = {
    initMap: initMap,
    getUserLocation: getUserLocation,
    calculateDeliveryFee: calculateDeliveryFee
  };
})();

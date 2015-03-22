var googleMap, defaultFocusPosition, placesService, venuesService;
var locationsData = [];
var delay = 100;
//https://api.foursquare.com/v2/venues/
//4c67de1d8e9120a1dc7cdb64?
//oauth_token=VOESV32DEI115APD1UWEL5OYW5BEGYUNYEP0G3QVSX3VQBOD&v=20150322

var VenuesService = function() {
  var _self = this;
  _self.oAuthToken = 'VOESV32DEI115APD1UWEL5OYW5BEGYUNYEP0G3QVSX3VQBOD';
  _self.date = '20150322';
  _self.getVenueDetails = function(req, successCb, errorCb) {
    var status, xhRes;
    var xhReq = new XMLHttpRequest();
    xhReq.open("GET", "https://api.foursquare.com/v2/venues/"+ req.venueId +
    "?oauth_token="+_self.oAuthToken+"&v="+_self.date, true);
    xhReq.onload = function() {
      xhRes = JSON.parse(xhReq.response);
      status = xhRes.meta.code;
      if(typeof successCb === 'function') {
        successCb(xhRes.response.venue, status);
      }
    }
    xhReq.onerror = function() {
      status = xhReq.status;
      if(typeof errorCb === 'function') {
        errorCb(status, xhReq);
      }
    }
    xhReq.send(null);
    //console.log(xhReq);
  }
}

var testVenuesService = function() {
  venuesService = new VenuesService();
  var request = {
    venueId: '4c67de1d8e9120a1dc7cdb64'
  }
  venuesService.getVenueDetails(request, function(venue, status) {
    console.log(status);
    console.log(data);
  }, function(status, xhr) {
    console.log(status);
    console.log(xhr);
  });
}

var MarkedLocation = function(name, lat, long, placeId, venueId) {
  var _self = this;
  _self.name = name;
  _self.lat = lat;
  _self.long = long;
  _self.latLng = new google.maps.LatLng(lat, long);
  _self.placeId = placeId; //Place ID from Google Places API
  _self.placeDetails = ko.observable(); //Place details from Google Places API
  _self.venueId = venueId; //Venue ID from Foursquare Venues API
  _self.venueDetails = ko.observable(); //Venue details from Foursquare Venues API
  _self.marker = ko.observable();
  _self.infoWindow = ko.observable();
  _self.infoWindowContent = ko.observable();
}

var HomePageViewModel = function() {
  var _self = this;
  _self.locations = ko.observableArray();
  _self.filteredLocations = ko.observableArray();
  _self.filterQuery = ko.observable("");
  _self.showSuggestions = ko.observable(false);
  _self.showLocations = ko.observable(true);
  _self.showSidebar = ko.observable(false);
  _self.showLocationDetails = ko.observable(false);
  _self.selectedLocation = ko.observable();
};

var homePageViewModel = new HomePageViewModel();
homePageViewModel.filterQuery.subscribe(function (value) {
  homePageViewModel.showSuggestions(value.length > 0);
});
homePageViewModel.locations.subscribe(function(changes) {
  for(var i = 0; i < changes.length; i++) {
    var change = changes[i].value;
    var markerOpts = {
      'map': googleMap,
      'position': change.latLng
    }
    var marker = new google.maps.Marker(markerOpts);
    change.marker(marker);
    var infoWindow = new google.maps.InfoWindow();
    change.infoWindowContent(change.name);
    infoWindow.setContent(change.infoWindowContent());
    change.infoWindow(infoWindow);
    google.maps.event.addListener(marker, 'click', function(e) {
      if(change.placeDetails() == undefined) {
      var placeRequest = {
        placeId: change.placeId
      }
      placesService.getDetails(placeRequest, function(place, status) {
        if(status == google.maps.places.PlacesServiceStatus.OK) {
          change.placeDetails(place);
        } else {
          console.log('Status from PlacesService: ' + status);
        }
      });
      var venueRequest = {
        venueId: change.venueId
      }
      venuesService.getVenueDetails(venueRequest, function(venue, status) {
        if(status == 200) {
          change.venueDetails(venue);
        } else {
          console.log('Status from VenuesService: ' + status);
        }
      });
    }
      infoWindow.open(googleMap, marker);
      homePageViewModel.showLocations(false);
      homePageViewModel.showSidebar(true);
      homePageViewModel.showLocationDetails(true);
      homePageViewModel.selectedLocation(change);
      googleMap.setCenter(change.latLng);
    });
  }
}, null, 'arrayChange');

ko.applyBindings(homePageViewModel);

locationsData.push(new MarkedLocation("Marine Life Park", 1.256236, 103.818944, 'ChIJkRh7fv4b2jEReRI7dnChCPg', '4f03c0e79a52357321ff272b'));
locationsData.push(new MarkedLocation("Telok Ayer Market", 1.280663, 103.850401, 'ChIJ5Y6l4Q0Z2jERYL0KDIjT6v0'));
locationsData.push(new MarkedLocation("River Safari", 1.403839, 103.789423, 'ChIJxZfX_9gT2jERknwK8es7IHU', '4f6a90836b74ab8c3fdea078'));
locationsData.push(new MarkedLocation("Old Ford Motor Factory", 1.353045, 103.769194, 'ChIJTcyXK1oQ2jERMjEftNlLGk0', '4b058810f964a5205baf22e3'));
locationsData.push(new MarkedLocation("Science Centre", 1.332900, 103.735791, 'ChIJY618FAQQ2jERzo1f5IAj4Bg', '4b058810f964a5206caf22e3'));
locationsData.push(new MarkedLocation("Mint Museum of Toys", 1.296294, 103.854505, 'ChIJW7B7zRIZ2jERINTI_uV1O-A', '4b058811f964a5209aaf22e3'));
locationsData.push(new MarkedLocation("Sentosa Island", 1.249406, 103.830302, 'ChIJRYMSeKwe2jERAR2QXVU39vg', '4c67de1d8e9120a1dc7cdb64'));
locationsData.push(new MarkedLocation("Singapore Zoo", 1.404284, 103.793023, 'ChIJr9wqENkT2jERkRs7pMj6FLQ', '4b05880ef964a520b8ae22e3'));
locationsData.push(new MarkedLocation("Singapore Flyer", 1.289320, 103.863094, 'ChIJzVHFNqkZ2jERboLN2YrltH8', '4b058810f964a52054af22e3'));
locationsData.push(new MarkedLocation("Singapore Botanic Gardens", 1.313899, 103.815925, 'ChIJvWDbfRwa2jERgNnTOpAU3-o', '4b3b3bd0f964a520ac7125e3'));
locationsData.push(new MarkedLocation("Jurong Bird Park", 1.318727, 103.706442, 'ChIJOVLiR10F2jERTB2-cCujA4o', '4b05880ef964a520b5ae22e3'));
locationsData.push(new MarkedLocation("Universal Studios", 1.254063, 103.823765, 'ChIJQ6MVplUZ2jERn1LmNH0DlDA', '4b1ee9ebf964a5207e2124e3'));
locationsData.push(new MarkedLocation("Buddha Tooth Relic Temple and Museum", 1.281623, 103.844316,'ChIJ0bwmznIZ2jEREOCMNggtIBk'));
locationsData.push(new MarkedLocation("Night Safari", 1.402123, 103.788018, 'ChIJ9xUuiNcT2jER49FS2OpE8W8', '4b05880ef964a520b7ae22e3'));
locationsData.push(new MarkedLocation("Asian Civilisations Museum", 1.287514, 103.851412, 'ChIJoZOhmQkZ2jERehLfvKlsoCA', '4b058810f964a52071af22e3'));
locationsData.push(new MarkedLocation("Underwater World", 1.258482, 103.811373, 'ChIJ36zKZvob2jERcbaD0IJUd-o', '4b05880ef964a520dcae22e3'));
locationsData.push(new MarkedLocation("Peranakan Museum", 1.294378, 103.849047, 'ChIJWZX956MZ2jERIGdnbs_SgMw', '4b058810f964a52078af22e3'));
locationsData.push(new MarkedLocation("Singapore History Museum", 1.296829, 103.848543, 'ChIJ69IuoA0Z2jERi_Q7GmHkApA', '4b989892f964a520334835e3'));

function initialize() {
  var mapOptions = {
    zoom: 12
  };
  googleMap = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
  placesService = new google.maps.places.PlacesService(googleMap);
  venuesService = new VenuesService();
  defaultFocusPosition = new google.maps.LatLng(1.367668, 103.823891);

  googleMap.setCenter(defaultFocusPosition);

  for(var i = 0; i < locationsData.length; i++) {
    homePageViewModel.locations.push(locationsData[i]);
  }

  google.maps.event.addListener(googleMap, 'click', function(e) {
    homePageViewModel.locations.push(new MarkedLocation("", e.latLng.lat(), e.latLng.lng()));
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
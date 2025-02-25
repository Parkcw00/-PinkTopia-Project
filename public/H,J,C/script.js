var mapContainer = document.getElementById('map'),
  mapOption = {
    center: new kakao.maps.LatLng(0, 0),
    level: 5,
  };

var map = new kakao.maps.Map(mapContainer, mapOption);

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude,
      lon = position.coords.longitude;

    var locPosition = new kakao.maps.LatLng(lat, lon),
      message = '<div style="padding:5px;">여기에 계신가요?!</div>';

    displayMarker(locPosition, message);
  });
} else {
  var locPosition = new kakao.maps.LatLng(0, 0),
    message = 'geolocation을 사용할 수 없어요..';

  displayMarker(locPosition, message);
}

function displayMarker(locPosition, message) {
  var marker = new kakao.maps.Marker({
    map: map,
    position: locPosition,
  });

  var infowindow = new kakao.maps.InfoWindow({
    content: message,
    removable: true,
  });

  infowindow.open(map, marker);
  map.setCenter(locPosition);
}

var markerData = [
  {
    position: new kakao.maps.LatLng(36.3275, 127.4268),
    imageUrl:
      'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fch0TFq%2FbtsMojyLajz%2FbWu5fv0Ox11EuAlSI9RxA1%2Fimg.png',
    size: new kakao.maps.Size(100, 100),
    info: '성심당 케익 부띠크!',
    draggable: true,
  },
  {
    position: new kakao.maps.LatLng(36.340309, 127.39),
    imageUrl:
      'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FN5k03%2FbtsMn0l4BNf%2F0Lk5if43ncFTjl9rzKCE61%2Fimg.png',
    size: new kakao.maps.Size(100, 100),
    info: '북마커 위치1',
    draggable: false,
  },
];

var markers = [];
markerData.forEach(function (data) {
  var markerImage = new kakao.maps.MarkerImage(data.imageUrl, data.size);
  var marker = new kakao.maps.Marker({
    position: data.position,
    image: markerImage,
    map: map,
    draggable: data.draggable,
  });

  var infowindow = new kakao.maps.InfoWindow({
    content: `<div style="padding:5px;">${data.info} <br>
              <a href="https://map.kakao.com/link/map/${data.info},${data.position.getLat()},${data.position.getLng()}" target="_blank" style="color:skyblue">큰지도보기</a> 
              <a href="https://map.kakao.com/link/to/${data.info},${data.position.getLat()},${data.position.getLng()}" target="_blank" style="color:blue">길찾기</a></div>`,
  });

  infowindow.open(map, marker);
  markers.push(marker);

  fetch('http://localhost:3000/direction/bookmarke')
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        var position = new kakao.maps.LatLng(item.latitude, item.longitude);

        var marker = new kakao.maps.Marker({
          position: position,
          map: map,
        });

        var infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;">${item.title} <br>
                  <a href="https://map.kakao.com/link/map/${item.title},${item.latitude},${item.longitude}" target="_blank" style="color:skyblue">큰지도보기</a> 
                  <a href="https://map.kakao.com/link/to/${item.title},${item.latitude},${item.longitude}" target="_blank" style="color:blue">길찾기</a></div>`,
        });

        infowindow.open(map, marker);
      });
    })
    .catch((error) => console.error('Error fetching data:', error));
});

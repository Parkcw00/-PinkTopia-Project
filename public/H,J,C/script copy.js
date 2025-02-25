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
// 여기서 북마커 호출
// src\direction\direction.controller.ts
// localhost:3000/direction/bookmarke  를 패치로 가져오기
var markerData = [
  // <- 가져온 북마커로 배열 생성.  반복문으로 적절하게 넣기
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
/** 북마커 추가*/
// 패치

// ✅ 서버에서 북마커 데이터 가져오기
fetch('http://localhost:3000/direction/bookmarke')
  .then((response) => response.json())
  .then((data) => {
    for (let bookmarkeS of data.bookmarksS) {
      let addBookmarke = {
        position: new kakao.maps.LatLng(
          bookmarkeS.latitude,
          bookmarkeS.longitude,
        ),
        imageUrl: bookmarkeS.sub_achievement_images,
        size: new kakao.maps.Size(100, 100),
        info: bookmarkeS.title,
        draggable: false,
      };
      markerData.push(addBookmarke);
    }
    for (let bookmarkeP of data.bookmarksP) {
      let addBookmarke = {
        position: new kakao.maps.LatLng(
          bookmarkeP.latitude,
          bookmarkeP.longitude,
        ),
        imageUrl:
          'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbnZWDr%2FbtsMxEa1tat%2Fd4s5w26JdYrq0b7Qp9wDt1%2Fimg.png',
        size: new kakao.maps.Size(100, 100),
        info: bookmarkeP.title,
        draggable: false,
      };
      markerData.push(addBookmarke);
    }
  })
  .catch((error) => console.error('Error fetching data:', error));

/** */

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
});

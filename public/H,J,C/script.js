let mapContainer = document.getElementById('map'),
  mapOption = {
    center: new kakao.maps.LatLng(0, 0),
    level: 5,
  };

let map = new kakao.maps.Map(mapContainer, mapOption);

// 현재 위치 표시
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    let lat = position.coords.latitude,
      lon = position.coords.longitude;

    let locPosition = new kakao.maps.LatLng(lat, lon),
      message = '<div style="padding:5px;">여기에 계신가요?!</div>';

    displayMarker(locPosition, message);
  });
} else {
  let locPosition = new kakao.maps.LatLng(0, 0),
    message = 'geolocation을 사용할 수 없어요..';

  displayMarker(locPosition, message);
}

function displayMarker(locPosition, message) {
  let marker = new kakao.maps.Marker({
    map: map,
    position: locPosition,
  });

  let infowindow = new kakao.maps.InfoWindow({
    content: message,
    removable: true,
  });

  infowindow.open(map, marker);
  map.setCenter(locPosition);
}


// 여기서 북마커 호출
let markerData = [];

// ✅ 서버에서 북마커 데이터 가져오기
console.log('📡 북마커 데이터를 요청합니다!'); // ✅ fetch 실행 전 확인 로그

// fetch('/direction/bookmarke') //
fetch('http://localhost:3000/direction/bookmarke')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log('✅ 패치 성공'); // ✅ 패치 성공 여부 확인
    return response.json();
  })
  .then((data) => {
    console.log('북마커 데이터:', data); // ✅ 데이터 확인용 콘솔 출력
 
    if (data.bookmarksS && Array.isArray(data.bookmarksS)) {
      data.bookmarksS.forEach((bookmarkeS) => {
        markerData.push({
          position: new kakao.maps.LatLng(
            bookmarkeS.latitude,
            bookmarkeS.longitude,
          ),
          imageUrl: bookmarkeS.sub_achievement_images,
          size: new kakao.maps.Size(50, 50), // 🔥 이미지 크기 조정 (100x100 → 50x50)
          info: bookmarkeS.title,
          draggable: false,
        });
      });
    }

    if (data.bookmarksP && Array.isArray(data.bookmarksP)) {
      data.bookmarksP.forEach((bookmarkeP) => {
        markerData.push({
          position: new kakao.maps.LatLng(
            bookmarkeP.latitude,
            bookmarkeP.longitude,
          ),
          imageUrl:
            'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbnZWDr%2FbtsMxEa1tat%2Fd4s5w26JdYrq0b7Qp9wDt1%2Fimg.png',
          size: new kakao.maps.Size(50, 50),
          info: bookmarkeP.title,
          draggable: false,
        });
      });
    }

    // 🔥 fetch 이후에 마커 추가 코드 실행
    addMarkersToMap();
  })
  .catch((error) => console.error('Error fetching data:', error));

// ✅ 마커 추가 함수
function addMarkersToMap() {
  if (markerData.length === 0) {
    console.warn('📢 북마커 데이터 없음');
    return;
  }

  var bounds = new kakao.maps.LatLngBounds();

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
    bounds.extend(data.position);
  });

  // ✅ 모든 마커가 추가된 후 지도 중심 조정
  map.setBounds(bounds);
}

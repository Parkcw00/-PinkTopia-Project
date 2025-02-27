let mapContainer = document.getElementById('map'),
  mapOption = {
    center: new kakao.maps.LatLng(0, 0),
    level: 5,
  };

let map = new kakao.maps.Map(mapContainer, mapOption);

// 현재 위치 표시
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(function (position) {
//     let lat = position.coords.latitude,
//       lon = position.coords.longitude;

//     let locPosition = new kakao.maps.LatLng(lat, lon),
//       message = '<div style="padding:5px;">여기에 계신가요?!</div>';

//     displayMarker(locPosition, message);
//   });
// } else {
//   let locPosition = new kakao.maps.LatLng(0, 0),
//     message = 'geolocation을 사용할 수 없어요..';

//   displayMarker(locPosition, message);
// }
const socket = io('/location', {
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': '*',
  },
});

function checkAccessToken() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error('❌ Access Token이 없습니다. 로그인 페이지로 이동합니다.');
    window.location.href = '/public/log-in.html';
  }
  return accessToken; // accessToken을 반환
}

const accessToken = checkAccessToken();

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

const decodedToken = parseJwt(accessToken);

function isTokenExpired(token) {
  const exp = decodedToken.exp * 1000; // 만료 시간을 밀리초로 변환
  return Date.now() >= exp; // 현재 시간이 만료 시간보다 크면 true
}

function startLocationUpdates() {
  if (accessToken && !isTokenExpired()) {
    setInterval(() => {
      if (isTokenExpired()) {
        socket.disconnect(); // 소켓 연결 종료
        alert('엑세스 토큰이 만료되었습니다. 다시 로그인하세요.');
        window.location.href = '/public/log-in.html'; // 로그인 페이지로 리다이렉트
      } else {
        sendLocation();
      }
    }, 10000); // 10초마다 위치 전송

    setInterval(() => {
      if (isTokenExpired()) {
        socket.disconnect();
        alert('엑세스 토큰이 만료되었습니다. 다시 로그인하세요.');
        window.location.href = '/public/log-in.html';
      } else {
        sendLocation10(); // ✅ 1분마다 실행되는 함수 수정
      }
    }, 60000); // 1분마다 실행

    requestLocationHistory();
  } else {
    socket.disconnect(); // 소켓 연결 종료
    alert('엑세스 토큰이 만료되었습니다. 다시 로그인하세요.');
    window.location.href = '/public/log-in.html'; // 로그인 페이지로 리다이렉트
  }
}

startLocationUpdates();
function sendLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const data = {
        userId: decodedToken.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      socket.emit('updateLocation', data);
    });
  } else {
    alert('Geolocation을 지원하지 않는 브라우저입니다.');
  }
}

function sendLocation10() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const data = {
        userId: decodedToken.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      socket.emit('updateLocationDB', data);

      // 10분마다 회사 DB에 사용자 위치 저장
      fetch('/location-history/db', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((resData) => console.log('✅ 위치 저장 성공:', resData))
        .catch((error) => console.error('❌ 위치 저장 실패:', error));
    });
  } else {
    alert('Geolocation을 지원하지 않는 브라우저입니다.');
  }
}

socket.on('locationUpdated', (data) => {
  console.log('✅ 서버 응답:', data);
});

socket.on('error', (error) => {
  console.error('❌ 서버 오류:', error);
});

socket.on('showPopup', (data) => {
  document.getElementById('popupMessage').innerText = data.message;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('popup').style.display = 'block';
});

document.getElementById('confirmButton').onclick = function () {
  window.location.href = '/public/catch_pinkmong.html'; // 확인 시 페이지 이동
};

document.getElementById('cancelButton').onclick = function () {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('popup').style.display = 'none'; // 팝업 닫기
};

// ✅ 로그인 후 위치 데이터를 요청
function requestLocationHistory() {
  // 위치 기록 서버에 PATCH 요청
  fetch('/location-history/valkey', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ user_id: decodedToken.id }),
  })
    .then((response) => response.json())
    .then((data) => console.log('✅ 위치 데이터 로드:', data))
    .catch((error) => console.error('❌ 위치 데이터 로드 실패:', error));

  // Geolocation API를 사용하여 현재 위치 정보 가져오기
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const data = {
        userId: decodedToken.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString(),
      };
      let locPosition = new kakao.maps.LatLng(data.latitude, data.longitude),
        message = '<div style="padding:5px;">여기에 계신가요?!</div>';

      displayMarker(locPosition, message);
      // 위치 정보를 포함하여 POST 요청 보내기
      fetch('/direction/compare-bookmark', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${accessToken}`,
        },
        body: JSON.stringify({
          user_direction: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
        }),
      })
        .then((response) => response.json())
        .then((result) => console.log('✅ 북마크 비교 결과:', result))
        .catch((error) => console.error('❌ 북마크 비교 요청 실패:', error));
    });
  } else {
    alert('Geolocation을 지원하지 않는 브라우저입니다.');
    let locPosition = new kakao.maps.LatLng(0, 0),
      message = 'geolocation을 사용할 수 없어요..';

    displayMarker(locPosition, message);
  }
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

/** */

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
    console, log('markerData : ', markerData);
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

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
    window.location.href = '/';
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
        window.location.href = '/'; // 로그인 페이지로 리다이렉트
      } else {
        sendLocation();
      }
    }, 10000); // 10초마다 위치 전송

    setInterval(() => {
      if (isTokenExpired()) {
        socket.disconnect();
        alert('엑세스 토큰이 만료되었습니다. 다시 로그인하세요.');
        window.location.href = '/';
      } else {
        sendLocation10(); // ✅ 1분마다 실행되는 함수 수정
      }
    }, 60000); // 1분마다 실행

    requestLocationHistory();
  } else {
    socket.disconnect(); // 소켓 연결 종료
    alert('엑세스 토큰이 만료되었습니다. 다시 로그인하세요.');
    window.location.href = '/'; // 로그인 페이지로 리다이렉트
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

// 새로 추가: 팝업 쿨다운 상태를 관리하는 변수
let popupCooldown = false; // 변경됨

socket.on('showPopup', (data) => {
  // 변경됨: 쿨다운 상태가 아니라면 팝업 표시
  if (!popupCooldown) {
    // 변경됨
    document.getElementById('popupMessage').innerText = data.message;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';

    // 팝업 표시 후 쿨다운 상태로 전환
    popupCooldown = true; // 변경됨

    // 2분(120,000ms) 후에 팝업 쿨다운 해제
    setTimeout(() => {
      popupCooldown = false; // 변경됨
    }, 120000); // 변경됨
  }
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
  }
  async function logout() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.warn('🚨 로그아웃 시도: 이미 로그아웃된 상태');
        window.location.href = '/public/log-in.html';
        return;
      }

      // 🔹 서버에 로그아웃 요청 보내기
      const response = await fetch('http://localhost:3000/user/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        credentials: 'include', // 쿠키도 함께 보내기
      });

      if (!response.ok) {
        throw new Error('서버에서 로그아웃 처리 실패');
      }

      // ✅ 로그아웃 성공 후, 토큰 삭제
      localStorage.removeItem('accessToken');

      console.log('✅ 로그아웃 성공! 페이지 이동');
      window.location.href = '/public/log-in.html'; // 로그인 페이지로 이동
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  }
}

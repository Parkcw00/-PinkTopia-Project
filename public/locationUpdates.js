const socket = io('/location', {
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': '*',
  },
});
function checkAccessToken() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error(':x: 로그인이 필요합니다.');
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
async function checkAndRefreshToken() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error(':x: 로그인이 필요합니다.');
    return;
  }

  const decodedToken = parseJwt(accessToken); // 토큰을 파싱하여 만료 시간 확인
  const exp = decodedToken.exp * 1000; // 만료 시간을 밀리초로 변환
  const now = Date.now();

  // 만료 시간의 1분(60000ms) 전이면 갱신 요청
  if (exp - now < 60000) {
    const refreshed = await refreshAccessToken(); // 갱신 요청
    if (!refreshed) {
      // 갱신이 성공하면 새로운 토큰으로 decodedToken 업데이트
      const newAccessToken = localStorage.getItem('accessToken');
      return parseJwt(newAccessToken); // 업데이트된 decodedToken 반환
    }
  }

  return decodedToken; // 갱신할 필요 없음
}

async function refreshAccessToken() {
  const refreshToken = getCookie('refreshToken'); // 리프레시 토큰을 쿠키에서 가져오는 함수
  if (!refreshToken) {
    console.error(':x: 리프레시 토큰이 없습니다. 다시 로그인 해주세요.');
    return;
  }
  try {
    const response = await fetch('/user/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
      credentials: 'include',
    });
    const data = await response.json();
    if (response.ok) {
      const newToken = response.headers.get('Authorization');
      if (newToken) {
        localStorage.setItem('accessToken', newToken);
        return false;
      }
    } else {
      console.error(':x: 엑세스 토큰 갱신 실패:', data);
      return true;
    }
  } catch (error) {
    console.error(':x: 토큰 갱신 중 오류 발생:', error);
  }
}

// 쿠키에서 리프레시 토큰을 가져오는 함수
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function startLocationUpdates() {
  if (accessToken) {
    setInterval(async () => {
      await sendLocation(); // 위치 전송
    }, 10000); // 10초마다 위치 전송

    setInterval(() => {
      sendLocation10(); // 1분마다 위치 저장
    }, 60000); // 1분마다 실행

    requestLocationHistory();
  } else {
    socket.disconnect(); // 소켓 연결 종료
    alert('엑세스 토큰이 만료되었습니다. 다시 로그인하세요.');
    window.location.href = '/'; // 로그인 페이지로 리다이렉트
  }
}
startLocationUpdates();
async function sendLocation() {
  const tokenRefreshed = await checkAndRefreshToken();
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
        .then((resData) =>
          console.log(':흰색_확인_표시: 위치 저장 성공:', resData),
        )
        .catch((error) => console.error(':x: 위치 저장 실패:', error));
    });
  } else {
    alert('Geolocation을 지원하지 않는 브라우저입니다.');
  }
}
socket.on('locationUpdated', (data) => {
  console.log(':흰색_확인_표시: 서버 응답:', data);
});
socket.on('error', (error) => {
  console.error(':x: 서버 오류:', error);
});
// 새로 추가: 팝업 쿨다운 상태를 관리하는 변수
let popupCooldown = false; // 변경됨
socket.on('showPopup', (data) => {
  // 마지막 포획 시도 시간 확인
  const lastCatchAttempt = localStorage.getItem('lastCatchAttempt');
  const now = new Date().getTime();
  // 마지막 포획 시도 후 2분이 지났거나, 시도 기록이 없는 경우에만 팝업 표시
  if (!lastCatchAttempt || now - parseInt(lastCatchAttempt) >= 120000) {
    document.getElementById('popupMessage').innerText = data.message;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
  }
});
document.getElementById('confirmButton').onclick = function () {
  // 확인 버튼 클릭 시 현재 시각 기록 후 catch_pinkmong 페이지로 이동
  localStorage.setItem('lastCatchAttempt', new Date().getTime().toString());
  window.location.href = '/public/catch_pinkmong.html';
};

document.getElementById('cancelButton').onclick = function () {
  // 취소 버튼 클릭 시에도 현재 시각 기록하여 2분 동안 팝업이 재표시되지 않게 함
  localStorage.setItem('lastCatchAttempt', new Date().getTime().toString());
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('popup').style.display = 'none';
};

// :흰색_확인_표시: 로그인 후 위치 데이터를 요청
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
    .then((data) => console.log(':흰색_확인_표시: 위치 데이터 로드:', data))
    .catch((error) => console.error(':x: 위치 데이터 로드 실패:', error));
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
        .then((result) =>
          console.log(':흰색_확인_표시: 북마크 비교 결과:', result),
        )
        .catch((error) => console.error(':x: 북마크 비교 요청 실패:', error));
    });
  } else {
    alert('Geolocation을 지원하지 않는 브라우저입니다.');
  }
  async function logout() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.warn(':경광등: 로그아웃 시도: 이미 로그아웃된 상태');
        window.location.href = '/public/log-in.html';
        return;
      }
      // :작은_파란색_다이아몬드: 서버에 로그아웃 요청 보내기
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
      // :흰색_확인_표시: 로그아웃 성공 후, 토큰 삭제
      localStorage.removeItem('accessToken');
      console.log(':흰색_확인_표시: 로그아웃 성공! 페이지 이동');
      window.location.href = '/public/log-in.html'; // 로그인 페이지로 이동
    } catch (error) {
      console.error(':x: 로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  }
}

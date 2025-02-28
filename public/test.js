let geocoder = new kakao.maps.services.Geocoder();

// 출발지 및 도착지 마커 객체 저장
let start = markers.find((m) => m.key === 'start').marker;
let end = markers.find((m) => m.key === 'end').marker;

// 입력창과 마커 연동 기능 추가
function setMarkerPosition(marker, addressInputId) {
  let inputElement = document.getElementById(addressInputId);

  geocoder.addressSearch(inputElement.value, function (result, status) {
    if (status === kakao.maps.services.Status.OK) {
      let coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      marker.setPosition(coords);
      map.setCenter(coords);
      localStorage.setItem(
        addressInputId + 'Location',
        JSON.stringify({ lat: result[0].y, lng: result[0].x }),
      );
    } else {
      alert('검색 결과가 없습니다.');
    }
  });
}

// 마커 드래그 시 입력창 값 변경
function updateInputValue(marker, addressInputId) {
  let inputElement = document.getElementById(addressInputId);
  let position = marker.getPosition();
  inputElement.value = `${position.getLat()}, ${position.getLng()}`;
}

// 출발지 입력 이벤트
document.getElementById('start').addEventListener('change', function () {
  setMarkerPosition(start, 'start');
});

// 도착지 입력 이벤트
document.getElementById('end').addEventListener('change', function () {
  setMarkerPosition(end, 'end');
});

// 마커 드래그 후 좌표 업데이트
kakao.maps.event.addListener(start, 'dragend', function () {
  updateInputValue(start, 'start');
});

kakao.maps.event.addListener(end, 'dragend', function () {
  updateInputValue(end, 'end');
});

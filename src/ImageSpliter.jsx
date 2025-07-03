import React, { useRef, useState, useEffect } from 'react';

const rotations = [0, 90, 180, 270];
const tileCount = 4;
const totalTimeSec = 60;

const ImageSplitter = () => {
  const canvasRef = useRef(null);
  const [tiles, setTiles] = useState([]);
  const [angles, setAngles] = useState([]);
  const [originalImage, setOriginalImage] = useState(null);
  const [puzzleStarted, setPuzzleStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeSec);

  // 정사각형 원본 이미지 dataURL (참고용)
  const [originalDataUrl, setOriginalDataUrl] = useState('');

  // 업로드 및 초기 세팅
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      // 원본 이미지를 정사각형으로 잘라서 저장 (참고용)
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = size;
      offscreenCanvas.height = size;
      const offCtx = offscreenCanvas.getContext('2d');
      offCtx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      setOriginalImage(offscreenCanvas);
      setOriginalDataUrl(offscreenCanvas.toDataURL());

      // 퍼즐 준비 상태 초기화 (게임 시작 전)
      setPuzzleStarted(false);
      setTimeLeft(totalTimeSec);
      setTiles([]);
      setAngles([]);
    };

    img.src = URL.createObjectURL(file);
  };

  // 퍼즐 시작 & 타일 생성 + 타이머 시작
  const startGame = () => {
    if (!originalImage) {
      alert('먼저 이미지를 업로드해주세요!');
      return;
    }

    const size = originalImage.width;
    const tileSize = size / tileCount;

    const newAngles = [];
    const newTiles = [];

    for (let y = 0; y < tileCount; y++) {
      for (let x = 0; x < tileCount; x++) {
        const angle = rotations[Math.floor(Math.random() * rotations.length)];
        newAngles.push(angle);

        const tileDataUrl = createRotatedTile(originalImage, x, y, tileSize, angle);
        newTiles.push(tileDataUrl);
      }
    }

    setAngles(newAngles);
    setTiles(newTiles);
    setPuzzleStarted(true);
    setTimeLeft(totalTimeSec);
  };

  // 타일 이미지 회전 생성 함수 (이전과 동일)
  const createRotatedTile = (sourceCanvas, tileX, tileY, tileSize, angle) => {
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileSize;
    tileCanvas.height = tileSize;
    const tileCtx = tileCanvas.getContext('2d');

    const rad = (angle * Math.PI) / 180;

    tileCtx.translate(tileSize / 2, tileSize / 2);
    tileCtx.rotate(rad);
    tileCtx.drawImage(
      sourceCanvas,
      tileX * tileSize,
      tileY * tileSize,
      tileSize,
      tileSize,
      -tileSize / 2,
      -tileSize / 2,
      tileSize,
      tileSize
    );
    tileCtx.resetTransform();

    return tileCanvas.toDataURL();
  };

  // 타일 클릭 시 회전 및 재생성
  const handleTileClick = (idx) => {
    if (!puzzleStarted) return;

    if (!originalImage) return;

    setAngles((prevAngles) => {
      const newAngles = [...prevAngles];
      const currentIndex = rotations.indexOf(newAngles[idx]);
      const nextIndex = (currentIndex + 1) % rotations.length;
      newAngles[idx] = rotations[nextIndex];

      setTiles((prevTiles) => {
        const newTiles = [...prevTiles];
        const tileSize = originalImage.width / tileCount;
        newTiles[idx] = createRotatedTile(originalImage, idx % tileCount, Math.floor(idx / tileCount), tileSize, newAngles[idx]);
        return newTiles;
      });

      return newAngles;
    });
  };

  // 타이머 처리 (useEffect)
  useEffect(() => {
    if (!puzzleStarted) return;

    if (timeLeft <= 0) {
      alert('시간 종료! 실패입니다.');
      setPuzzleStarted(false);
      return;
    }

    // 퍼즐이 맞춰졌는지 체크
    if (checkPuzzleSolved()) {
      alert('축하합니다! 성공했어요!');
      setPuzzleStarted(false);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, puzzleStarted]);

  // 퍼즐 성공 체크 함수
  // 각 타일이 원본과 같은 방향(0도)인지 확인하는 간단 조건
  // 더 정확히 하려면 이미지 데이터 비교 가능하지만 복잡하므로 각도 비교로 구현
  const checkPuzzleSolved = () => {
    return angles.every((angle) => angle === 0);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '900px', margin: '20px auto' }}>
      {/* 왼쪽 원본 이미지 (참고용) */}
      <div>
        <h3>원본 이미지</h3>
        {originalDataUrl ? (
          <img src={originalDataUrl} alt="original" style={{ width: '300px', border: '1px solid #ccc' }} />
        ) : (
          <p>이미지를 업로드해주세요.</p>
        )}
      </div>

      {/* 오른쪽 퍼즐 영역 */}
      <div style={{ flex: 1 }}>
        <h2>이미지 16등분 퍼즐 게임</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={puzzleStarted} />
        <br />
        <button onClick={startGame} disabled={!originalImage || puzzleStarted} style={{ marginTop: '10px', padding: '10px 20px' }}>
          Game Start
        </button>

        {/* 타이머 */}
        <div style={{ marginTop: '15px', fontSize: '18px' }}>
          시간 남음: {timeLeft}초
        </div>

        {/* 퍼즐 타일 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tileCount}, 1fr)`,
            gap: '3px',
            marginTop: '20px',
            maxWidth: '400px',
            userSelect: 'none',
          }}
        >
          {tiles.map((tile, idx) => (
            <img
              key={idx}
              src={tile}
              alt={`tile-${idx}`}
              style={{ width: '100%', cursor: puzzleStarted ? 'pointer' : 'default' }}
              onClick={() => handleTileClick(idx)}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSplitter;

// frontend/src/pages/ranking.js
import '../style.css';
import '../css/ranking.css';
import { getRanking } from '../api.js';

// 🌟 設定値（定数）
const LIMIT = 50;      // 1ページあたりの表示数
const MAX_RANK = 300;  // ランキングの最大表示順位
let currentOffset = 0; // 現在の開始位置（0なら1位から）

// 🌟 ランキングを読み込んで表を更新する関数（引数に offset を取る）
async function loadRanking(offset) {
  const tbody = document.getElementById('ranking-body');
  const podiumContainer = document.getElementById('podium-container'); 
  
  // 自動更新の際に「読み込み中...」の文字が一瞬チラつくのを防ぐため、
  // tbodyの中身が空（初回アクセス）の時だけ「読み込み中」を表示します
  if (tbody.innerHTML.trim() === '') {
    tbody.innerHTML = '<tr><td colspan="4">読み込み中...</td></tr>';
  }

  // APIを叩く
  const result = await getRanking(LIMIT, offset);

  if (result && result.success) {
    tbody.innerHTML = ''; // 💡 ここで前回の中身をリセット！（増殖バグ防止の神コード）
    
    if (result.ranking.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">この範囲にはまだ記録がありません</td></tr>';
      podiumContainer.style.display = 'none'; 
      updatePaginationUI(offset);
      return;
    }

    let listData = result.ranking; 

    // 🌟 1ページ目（1〜50位）の時だけ、表彰台の処理を行う！
    if (offset === 0) {
      podiumContainer.style.display = 'flex'; 
      
      const top3 = result.ranking.slice(0, 3);
      listData = result.ranking.slice(3); 

      const setPodium = (rank, data) => {
        document.getElementById(`podium-name-${rank}`).textContent = data ? (data.name || '名無し') : '-';
        document.getElementById(`podium-score-${rank}`).textContent = data ? `${data.score}点` : '-';
        
        const timeText = (data && data.time_seconds) 
          ? `${Math.floor(data.time_seconds / 60)}分${data.time_seconds % 60}秒` 
          : '-';
        document.getElementById(`podium-time-${rank}`).textContent = timeText;
      };
      
      setPodium(1, top3[0]);
      setPodium(2, top3[1]);
      setPodium(3, top3[2]);

    } else {
      // 2ページ目以降は表彰台を隠す
      podiumContainer.style.display = 'none';
    }

    // テーブルに描画する
    listData.forEach((data, index) => {
      const rank = (offset === 0) ? offset + index + 4 : offset + index + 1; 
      
      const timeText = data.time_seconds 
        ? `${Math.floor(data.time_seconds / 60)}分${data.time_seconds % 60}秒` 
        : '-';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rank}位</td>
        <td>${data.name || '名無し'}</td>
        <td class="score-text">${data.score}</td>
        <td>${timeText}</td>
      `;
      tbody.appendChild(tr);
    });
    
    updatePaginationUI(offset);

  } else {
    tbody.innerHTML = '<tr><td colspan="4" class="error-message">ランキングの取得に失敗しました</td></tr>';
  }
}

// 🌟 ボタンのテキストと表示/非表示をコントロールする関数
function updatePaginationUI(offset) {
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const info = document.getElementById('current-page-info');

  const currentStart = offset + 1;
  const currentEnd = offset + LIMIT;
  info.textContent = `${currentStart}〜${currentEnd}位`;

  if (offset === 0) {
    prevBtn.style.visibility = 'hidden'; 
  } else {
    prevBtn.style.visibility = 'visible';
    const prevStart = offset - LIMIT + 1;
    const prevEnd = offset;
    prevBtn.textContent = `◀ ${prevStart}〜${prevEnd}位`;
  }

  if (offset + LIMIT >= MAX_RANK) {
    nextBtn.style.visibility = 'hidden';
  } else {
    nextBtn.style.visibility = 'visible';
    const nextStart = offset + LIMIT + 1;
    const nextEnd = offset + LIMIT * 2;
    nextBtn.textContent = `${nextStart}〜${nextEnd}位 ▶`;
  }
}

// 🌟 イベントリスナー
document.getElementById('prev-page-btn').addEventListener('click', () => {
  if (currentOffset >= LIMIT) {
    currentOffset -= LIMIT;
    loadRanking(currentOffset);
  }
});

document.getElementById('next-page-btn').addEventListener('click', () => {
  if (currentOffset + LIMIT < MAX_RANK) {
    currentOffset += LIMIT;
    loadRanking(currentOffset);
  }
});

document.getElementById('back-to-course-btn').addEventListener('click', () => {
  window.location.href = 'course.html';
});

// ==========================================
// 🌟 会場サイネージ用：自動更新ロジック
// ==========================================
const POLLING_INTERVAL = 7000; // 7秒間隔

function setupAutoUpdate() {
  const urlParams = new URLSearchParams(window.location.search);
  const isVenueMode = urlParams.get('venue') === 'true';

  if (isVenueMode) {
    console.log('📺 会場サイネージモード起動：7秒ごとに自動更新します！');
    
    setInterval(async () => {
      console.log('🔄 最新ランキングデータを取得中...');
      // 💡 現在のページ（currentOffset）を維持したまま裏側で更新する
      await loadRanking(currentOffset); 
    }, POLLING_INTERVAL);
  } else {
    console.log('📱 通常モード：自動更新は行いません');
  }
}

// 🌟 画面が表示された瞬間の実行処理
// 1. 最初の50件を読み込む
loadRanking(currentOffset).then(() => {
  // 2. 読み込みが終わったら、自動更新の監視をスタートする
  setupAutoUpdate();
});
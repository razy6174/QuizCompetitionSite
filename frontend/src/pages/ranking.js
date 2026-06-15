// frontend/src/pages/ranking.js

import { getRanking } from '../api.js';

// 🌟 設定値（定数）
const LIMIT = 50;      // 1ページあたりの表示数
const MAX_RANK = 300;  // ランキングの最大表示順位
let currentOffset = 0; // 現在の開始位置（0なら1位から）

// 🌟 ランキングを読み込んで表を更新する関数（引数に offset を取る）
async function loadRanking(offset) {
  const tbody = document.getElementById('ranking-body');
  const podiumContainer = document.getElementById('podium-container'); // 🌟 表彰台の箱を取得
  tbody.innerHTML = '<tr><td colspan="4">読み込み中...</td></tr>';

  // APIを叩く（例: limit=50, offset=0 or 50 or 100...）
  const result = await getRanking(LIMIT, offset);

  if (result && result.success) {
    tbody.innerHTML = '';
    
    if (result.ranking.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">この範囲にはまだ記録がありません</td></tr>';
      podiumContainer.style.display = 'none'; // データがなければ表彰台も隠す
      updatePaginationUI(offset);
      return;
    }

    let listData = result.ranking; // テーブルに表示する用の配列

    // 🌟 1ページ目（1〜50位）の時だけ、表彰台の処理を行う！
    if (offset === 0) {
      podiumContainer.style.display = 'flex'; // 表彰台を表示
      
      // 最初の3件を抜き出し、リスト用データからは削除する
      const top3 = result.ranking.slice(0, 3);
      listData = result.ranking.slice(3); 

      // 表彰台に文字をセットする関数（データがない場合も考慮）
      const setPodium = (rank, data) => {
        document.getElementById(`podium-name-${rank}`).textContent = data ? (data.name || '名無し') : '-';
        document.getElementById(`podium-score-${rank}`).textContent = data ? `${data.score}点` : '-';
      };
      
      // 左から2位、1位、3位の順にセット
      setPodium(1, top3[0]);
      setPodium(2, top3[1]);
      setPodium(3, top3[2]);

    } else {
      // 🌟 2ページ目（51位〜）以降は表彰台を完全に隠す
      podiumContainer.style.display = 'none';
    }

    // 🌟 抜き出された残りのデータ（listData）をテーブルに描画する
    listData.forEach((data, index) => {
      // 1ページ目の時はすでに3人抜けているので +4 からスタート、それ以外は通常通り +1
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
    
    // 🌟 表の更新が終わったら、ボタンの表示も更新する
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

  // 真ん中のテキスト（例：51〜100位）
  const currentStart = offset + 1;
  const currentEnd = offset + LIMIT;
  info.textContent = `${currentStart}〜${currentEnd}位`;

  // ◀ 左ボタン（上位へ）の制御
  if (offset === 0) {
    // 1ページ目の時はボタンを隠す（visibilityを使うとレイアウトが崩れない）
    prevBtn.style.visibility = 'hidden'; 
  } else {
    prevBtn.style.visibility = 'visible';
    const prevStart = offset - LIMIT + 1;
    const prevEnd = offset;
    prevBtn.textContent = `◀ ${prevStart}〜${prevEnd}位`;
  }

  // ▶ 右ボタン（下位へ）の制御
  if (offset + LIMIT >= MAX_RANK) {
    // 300位まで到達したらボタンを隠す
    nextBtn.style.visibility = 'hidden';
  } else {
    nextBtn.style.visibility = 'visible';
    const nextStart = offset + LIMIT + 1;
    const nextEnd = offset + LIMIT * 2;
    nextBtn.textContent = `${nextStart}〜${nextEnd}位 ▶`;
  }
}

// 🌟 イベントリスナー（ボタンが押された時の処理）
document.getElementById('prev-page-btn').addEventListener('click', () => {
  if (currentOffset >= LIMIT) {
    currentOffset -= LIMIT;
    loadRanking(currentOffset); // 新しいオフセットで再読み込み！
  }
});

document.getElementById('next-page-btn').addEventListener('click', () => {
  if (currentOffset + LIMIT < MAX_RANK) {
    currentOffset += LIMIT;
    loadRanking(currentOffset); // 新しいオフセットで再読み込み！
  }
});

document.getElementById('back-to-course-btn').addEventListener('click', () => {
  window.location.href = 'course.html';
});

// 画面が表示された瞬間に最初の50件を読み込む
loadRanking(currentOffset);
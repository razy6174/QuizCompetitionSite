// frontend/src/pages/ranking.js

import { getRanking } from '../api.js';

async function loadRanking() {
  const tbody = document.getElementById('ranking-body');
  
  // APIからランキングデータ（TOP50）を取得
  const result = await getRanking(50, 0);

  if (result && result.success) {
    tbody.innerHTML = ''; // 「読み込み中...」の文字を消す

    if (result.ranking.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">まだ記録がありません</td></tr>';
      return;
    }

    // 取得したデータをループして、1行ずつテーブルに追加する
    result.ranking.forEach((data, index) => {
      const rank = index + 1; 
      
      // タイム計算のロジック
      const timeText = data.time_seconds 
        ? `${Math.floor(data.time_seconds / 60)}分${data.time_seconds % 60}秒` 
        : '-';
      
      const tr = document.createElement('tr');

      // 🌟 【プロの小技】JSで色は塗らず、CSS用のクラス名だけを付与しておく
      if (rank === 1) tr.classList.add('rank-1');
      if (rank === 2) tr.classList.add('rank-2');
      if (rank === 3) tr.classList.add('rank-3');

      tr.innerHTML = `
        <td>${rank}位</td>
        <td>${data.name || '名無し'}</td>
        <td class="score-text">${data.score}</td>
        <td>${timeText}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="4" class="error-message">ランキングの取得に失敗しました</td></tr>';
  }
}

// 戻るボタンのルーティング処理
document.getElementById('back-to-course-btn').addEventListener('click', () => {
  window.location.href = 'course.html';
});

// 画面が表示された瞬間にランキングの読み込みを開始
loadRanking();
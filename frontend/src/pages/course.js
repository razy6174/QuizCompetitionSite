import { loginAndGetUserInfo } from '../api.js';

// 今回クイズをする人のIDを保存しておくための「空の箱」を用意
let currentUserId = null;

// ① ページが開かれたら最初に実行される処理
async function init() {
  // バックエンドに話しかけてユーザー情報を取得（ここは本番でも必須！）
  const result = await loginAndGetUserInfo();

  if (result && result.success) {
    // 成功したら、後で使えるようにIDを箱に保存しておく！
    currentUserId = result.user.id; 
    console.log('準備完了：ユーザーID', currentUserId);
  } else {
    alert('ユーザー情報の取得に失敗しました。画面を再読み込みしてください。');
  }
}

// ② スタートボタンが押された時の処理
document.getElementById('start-btn').addEventListener('click', async () => {
  // まだログイン情報の取得が終わってない（IDがない）場合は弾く
  if (!currentUserId) {
    alert('ユーザー情報を読み込み中です。少し待ってからもう一度押してください。');
    return;
  }

  try {
    // バックエンドのスタートAPIを叩く
    const response = await fetch('https://localhost:8787workers.dev/api/start-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId }) // 保存しておいたIDをここで使う！
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ セッション開始！時刻:', data.session.start_time);
      
      // 画面を一瞬で切り替える
      document.getElementById('start-screen').style.display = 'none'; // スタート画面を消す
      document.getElementById('quiz-screen').style.display = 'block'; // クイズ画面を出す
    } else {
      alert('エラーが発生しました。もう一度お試しください。');
    }
  } catch (error) {
    console.error('通信エラー:', error);
  }
});

// ページ読み込み完了時に init を実行
document.addEventListener('DOMContentLoaded', init);
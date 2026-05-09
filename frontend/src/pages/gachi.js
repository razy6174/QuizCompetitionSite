// frontend/src/pages/gachi.js
import { loginAndGetUserInfo, API_BASE_URL} from '../api.js'; // パスはフォルダ構成に合わせて調整してください

let currentUserId = null;
let currentSessionId = null;

// 👇 これを復活させます！
async function init() {
  console.log('ユーザー情報を取得しています...');
  const result = await loginAndGetUserInfo();

  if (result && result.success) {
    // 無事に思い出した！箱にIDを入れる！
    currentUserId = result.user.id; 
    console.log('✅ ガチコース準備完了：ユーザーID', currentUserId);
  } else {
    // 本当にログイン情報がない場合だけ弾く
    alert('ログイン情報がありません。ログイン画面に戻ります。');
    window.location.href = 'index.html'; 
  }
}

// ② ガチコースのスタートボタンが押された時の処理
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentUserId) {
    alert('ユーザー情報を読み込み中です...');
    return;
  }

  try {
    // ローカルのバックエンドのAPIを叩く
    const response = await fetch(`${API_BASE_URL}/api/start-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ ガチコース開始！時刻:', data.session.start_time);
      
      // 画面を一瞬で切り替える
      //document.getElementById('start-screen').style.display = 'none';
      //document.getElementById('quiz-screen').style.display = 'block';
    } else {
      alert('エラーが発生しました。');
    }
  } catch (error) {
    console.error('通信エラー:', error);
  }
});

// ページ読み込み完了時に init を実行
document.addEventListener('DOMContentLoaded', init);
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

// frontend/src/pages/gachi.js のイメージ
let quizData = []; // ここに15問のデータが入る

// 🌟 完成版の表示関数！
function displayQuestion(index) {
  // ① quizDataの箱から、今の問題（index番目）を取り出す
  const q = quizData[index]; 
  
  // ② HTMLの箱に、問題番号と問題文を文字として流し込む！
  document.getElementById('question-number').textContent = `第${index + 1}問`;
  document.getElementById('question-text').textContent = q.question_text;
  
  // ③ 4つの選択肢ボタンを全部集めてきて、それぞれに文字を入れる！
  const buttons = document.querySelectorAll('.choice-btn');
  buttons[0].textContent = q.choice_a;
  buttons[1].textContent = q.choice_b;
  buttons[2].textContent = q.choice_c;
  buttons[3].textContent = q.choice_d;
}

// ② ガチコースのスタートボタンが押された時の処理
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentUserId) {
    alert('ユーザー情報を読み込み中です...');
    return;
  }

  const clickTime = new Date().toISOString();

  try {
    // ローカルのバックエンドのAPIを叩く
    const response = await fetch(`${API_BASE_URL}/api/start-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, start_time: clickTime }) // ユーザーIDとクリックした時刻を送る
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
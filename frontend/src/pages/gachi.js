// frontend/src/pages/gachi.js
import { getCurrentUserId, startQuizSession } from '../api.js';

let currentUserId = null;

async function init() {
  console.log('ユーザー情報を取得しています...');
  currentUserId = await getCurrentUserId();

  if (currentUserId) {
    console.log('✅ ガチコース準備完了：ユーザーID', currentUserId);
    return;
  }

  alert('ユーザー情報がありません。ログイン画面に戻ります。');
  window.location.href = 'index.html';
}

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
  const result = await startQuizSession(currentUserId);

    if (result && result.success) {
      console.log('✅ ガチコース開始！サーバー側で時間記録完了');
      
      // 画面を一瞬で切り替える
      document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';

    // 💡 ここで displayQuestion(0) などを呼び出して、第1問を表示させる！
    
  } else {
    alert('エラーが発生しました。もう一度お試しください。');
  }
});

// ページ読み込み完了時に init を実行
document.addEventListener('DOMContentLoaded', init);
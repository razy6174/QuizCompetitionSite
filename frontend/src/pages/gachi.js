// frontend/src/pages/gachi.js
import { getCurrentUserId, startQuizSession, fetchQuizQuestions} from '../api.js';

// ==========================================
// 📦 1. ゲームの状態（ステート）を記憶する箱たち
// ==========================================
let quizData = [];            // 15問のクイズデータを保存する箱
let currentQuestionIndex = 0; // 今何問目？ (0〜14)
let currentScore = 0;         // 正解数（スコア）
let currentSessionId = null;  // サーバーから発行された今回の整理券番号
let currentUserId = null;     // 今ログインしているユーザーのIDを保存する箱

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

// ==========================================
// 🚀 2. スタートボタンが押された時（入り口）
// ==========================================
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentUserId) return alert('ユーザー情報がありません。');

  // ① 1回の通信で「時間記録」と「問題取得」を同時に終わらせる！（courseに 'gachi' を指定）
  const result = await startQuizAndGetQuestions(currentUserId, 'gachi');
  
  if (!result?.success) return alert('通信エラーが発生しました。');

  // ② 届いたダンボール箱（result）から、整理券と問題データを取り出す！
  currentSessionId = result.sessionId;
  quizData = result.questions;

  // ③ 画面を一瞬で切り替えて、いざ第1問（index: 0）を表示！
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  
  displayQuestion(currentQuestionIndex); 
});

// ==========================================
// 📺 3. 問題を画面に表示する関数
// ==========================================
function displayQuestion(index) {
  const q = quizData[index]; 
  document.getElementById('question-number').textContent = `第${index + 1}問`;
  document.getElementById('question-text').textContent = q.question_text;
  
  const buttons = document.querySelectorAll('.choice-btn');
  buttons[0].textContent = q.choice_a;
  buttons[1].textContent = q.choice_b;
  buttons[2].textContent = q.choice_c;
  buttons[3].textContent = q.choice_d;
}

// ==========================================
// 👆 4. 選択肢ボタンが押された時の処理
// ==========================================
const choiceButtons = document.querySelectorAll('.choice-btn');
choiceButtons.forEach((button, buttonIndex) => {
  // 4つのボタンそれぞれに「クリックされたら」の処理をセット
  button.addEventListener('click', () => {
    
    // 💡 ① ここで正誤判定をして、正解なら currentScore を増やす処理が入ります！

    // ② 次の問題へ進む準備
    currentQuestionIndex++; // インデックスを1増やす

    // ③ まだ問題が残っているかチェック
    if (currentQuestionIndex < 15) {
      // 残っていたら次の問題を表示！
      displayQuestion(currentQuestionIndex);
    } else {
      // 15問終わったら終了処理へバトンタッチ！
      finishGame();
    }
  });
});

// ==========================================
// 🏁 5. ゲーム終了処理
// ==========================================
async function finishGame() {
  console.log(`✅ 15問終了！ スコア: ${currentScore} / 15`);
  
  // 💡 ここで「終了時間を記録するAPI」を呼び出します（後で作る）
  // await finishQuizSession(currentUserId, currentSessionId, currentScore, 'gachi');

  // 結果画面へ切り替える
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';
}

// ページ読み込み完了時に init を実行
document.addEventListener('DOMContentLoaded', init);
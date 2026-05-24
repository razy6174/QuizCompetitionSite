// frontend/src/pages/gachi.js
import { getCurrentUserId, startQuizAndGetQuestions, submitQuizAnswer} from '../api.js';

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

// 💡 0〜3番目のボタンを、データベース用の 'A', 'B', 'C', 'D' に変換するための辞書
const choiceMap = ['A', 'B', 'C', 'D'];

choiceButtons.forEach((button, buttonIndex) => {
  // 4つのボタンそれぞれに「クリックされたら」の処理をセット
  button.addEventListener('click', () => {

    // 🛡️ フロントエンド側の連打防止策：通信が終わるまで全てのボタンを押せなくする（ロック）
    choiceButtons.forEach(btn => btn.disabled = true);
    
    // 今解いている問題のデータと、選んだ選択肢（'A'〜'D'）を取得
    const currentQuestion = quizData[currentQuestionIndex];
    const selectedChoice = choiceMap[buttonIndex];

    // 📡 ① バックエンドに解答を提出し、正誤判定をしてもらう！
    const result = await submitQuizAnswer(currentSessionId, currentQuestion.id, selectedChoice);

    if (result && result.success) {
      // ② 正解だった場合、スコアを増やす
      if (result.isCorrect) {
        currentScore++;
        console.log('⭕️ 正解！ 現在のスコア:', currentScore);
      } else {
        console.log(`❌ 不正解... 正解は ${result.correctChoice} でした`);
      }
    } else {
      alert('通信エラーが発生しました。解答が記録されていない可能性があります。');
    }

    // ② 次の問題へ進む準備
    currentQuestionIndex++; // インデックスを1増やす

// ④ まだ問題が残っているかチェック
    if (currentQuestionIndex < 15) {
      displayQuestion(currentQuestionIndex); // 次の問題を表示
    } else {
      finishGame(); // 15問終わったら終了処理へ
    }

    // 🔓 画面が切り替わったら、ボタンのロックを解除してあげる
    choiceButtons.forEach(btn => btn.disabled = false);
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
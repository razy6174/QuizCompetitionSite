// frontend/src/pages/enjoy.js
import { getCurrentUserId, startQuizAndGetQuestions, finishQuizSession} from '../api.js';
import '../style.css';
import '../css/enjoy.css';
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
    console.log('✅ エンジョイコース準備完了：ユーザーID', currentUserId);
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

  // ① 1回の通信で「時間記録」と「問題取得」を同時に終わらせる！（courseに 'enjoy' を指定）
  const result = await startQuizAndGetQuestions(currentUserId, 'enjoy');
  
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

  const imgElement = document.getElementById('question-image');
  if (q.image_url) {
    imgElement.src = q.image_url;
    imgElement.style.display = 'block';
  } else {
    imgElement.style.display = 'none';
  }
  
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
const choiceMap = ['A', 'B', 'C', 'D'];

choiceButtons.forEach((button, buttonIndex) => {
  button.addEventListener('click', () => {
    
    // 🛡️ 連打防止：判定中は全てのボタンを押せなくする（ロック！）
    choiceButtons.forEach(btn => btn.disabled = true);

    const currentQuestion = quizData[currentQuestionIndex];
    const selectedChoice = choiceMap[buttonIndex];

    // 💡 ① 判定して、押したボタンに色（クラス）をつける！
    if (currentQuestion.correct_choice === selectedChoice) {
      currentScore++;
      console.log('⭕️ 正解！ 現在のスコア:', currentScore);
      button.classList.add('correct'); // 緑色＋⭕️にする
    } else {
      console.log(`❌ 不正解... 正解は ${currentQuestion.correct_choice} でした`);
      button.classList.add('incorrect'); // 赤色＋❌にする
      // 正解の選択肢に色をつける
      const correctButton = choiceButtons[choiceMap.indexOf(currentQuestion.correct_choice)];
      correctButton.classList.add('correct');
    }

    // ⏱️ ② 1秒（1000ミリ秒）待ってから、次の処理へ進む！
    setTimeout(() => {
      // 色のシールを剥がして、元の白いボタンに戻す
      choiceButtons.forEach(btn => btn.classList.remove('correct', 'incorrect'));
      // ボタンのロックを解除する
      choiceButtons.forEach(btn => btn.disabled = false);

      // ③ 次の問題へ進む準備
      currentQuestionIndex++;

      // ④ まだ問題が残っているかチェック
      if (currentQuestionIndex < 10) {
        displayQuestion(currentQuestionIndex);
      } else {
        finishGame();
      }
    }, 1000); // 👈 1000 = 1秒（短くしたい時は 800 などに調整可能）

  });
});

// ==========================================
// 🏁 5. ゲーム終了処理
// ==========================================
async function finishGame() {
  console.log(`✅ 10問終了！ スコア: ${currentScore} / 10`);
  
  // 💡 ここで「終了時間を記録するAPI」を呼び出します（後で作る）
  // await finishQuizSession(currentUserId, currentSessionId, currentScore, 'enjoy');
  // ① 終了APIを叩く（スコア計算はサーバーにお任せ！）
    const result = await finishQuizSession(currentSessionId, 'enjoy', currentScore);
    console.log('📦 APIからの返事:', result);
  
  if (result && result.success) {
      // ② サーバーが計算した「正式なスコア」を結果画面に流し込む
      // ※ HTML側に <span id="final-score-display">0</span> がある前提です
      const scoreElement = document.getElementById('final-score-display');
      if (scoreElement) {
        scoreElement.textContent = result.finalScore;
      }

       // 結果画面へ切り替える
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('result-screen').style.display = 'block';

  }else alert('結果の保存に失敗しました。');
}

document.getElementById('back-to-course-btn').addEventListener('click', () => {
  window.location.href = 'course.html';
});

// 🌟 青い「アンケートボタン」が押された時（新しいタブが開くのを少し待つ！）
document.getElementById('survey-btn').addEventListener('click', () => {
  // ブラウザが確実に新しいタブ（Forms）を開くための猶予（500ミリ秒）を与える
  setTimeout(() => {
    window.location.href = 'course.html';
  }, 500); 
});

// ページ読み込み完了時に init を実行
document.addEventListener('DOMContentLoaded', init);
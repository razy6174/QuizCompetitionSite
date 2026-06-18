// frontend/src/pages/gachi.js
import { getCurrentUserId, startQuizAndGetQuestions, submitQuizAnswer, finishQuizSession, getCurrentUserName} from '../api.js';

import '../style.css';
import '../css/gachi.css';

// 🌟 1. 解禁日時を設定（JST: 日本時間）
// ※ 年号は現在の環境に合わせて「2026」や「2024」に変更してください
const TARGET_START_TIME = new Date('2026-06-29T00:00:00+09:00').getTime();

// const TARGET_START_TIME = Date.now() + 5000; // ⏳ テスト用：5秒後に解禁

// ==========================================
// 📦 1. ゲームの状態（ステート）を記憶する箱たち
// ==========================================
let quizData = [];            // 15問のクイズデータを保存する箱
let currentQuestionIndex = 0; // 今何問目？ (0〜14)
let currentScore = 0;         // 正解数（スコア）
let currentSessionId = null;  // サーバーから発行された今回の整理券番号
let currentUserId = null;     // 今ログインしているユーザーのIDを保存する箱
let timerInterval; // タイマーを止めるための変数
let startTime;     // スタート時の時間

async function init() {
  console.log('ユーザー情報を取得しています...');
  currentUserId = await getCurrentUserId();

  // 🌟 追加：ヘッダーのユーザー名を更新
  const userName = await getCurrentUserName();
  const headerNameEl = document.getElementById('header-user-name');
  if (headerNameEl) headerNameEl.textContent = userName;

  if (currentUserId) {
    console.log('✅ ガチコース準備完了：ユーザーID', currentUserId);
    checkStartTime();
    return;
  }

  alert('ユーザー情報がありません。ログイン画面に戻ります。');
  window.location.href = 'index.html';
}

function checkStartTime() {
  const now = Date.now();
  
  if (now < TARGET_START_TIME) {
    // ⏳ まだ始まっていない場合
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('countdown-screen').style.display = 'block';

    // 1秒（1000ミリ秒）ごとに時計を更新
    const timerInterval = setInterval(() => {
      const timeLeft = TARGET_START_TIME - Date.now();
      
      // 🚀 時間になった瞬間！
      if (timeLeft <= 0) {
        clearInterval(timerInterval); // 時計を止める
        document.getElementById('countdown-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'block';
        return;
      }

      // 残り時間を「日・時間・分・秒」に計算
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      // 「1日 12:05:09」のような文字列を作る（ゼロ埋め）
      let timeString = '';
      if (days > 0) timeString += `${days}日 `;
      timeString += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      document.getElementById('countdown-timer').textContent = timeString;
    }, 1000);

  } else {
    // 🟢 すでに始まっている場合（カウントダウン画面は出さずに直接スタート画面へ）
    document.getElementById('countdown-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
  }
}

// 🌟 カウントダウン画面の「戻る」ボタンの処理も追加
document.getElementById('back-to-course-from-countdown').addEventListener('click', () => {
  window.location.href = 'course.html';
});

// ==========================================
// 🚀 2. スタートボタンが押された時（入り口）
// ==========================================
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentUserId) return alert('ユーザー情報がありません。');

  // ① 1回の通信で「時間記録」と「問題取得」を同時に終わらせる！（courseに 'gachi' を指定）
  const result = await startQuizAndGetQuestions(currentUserId, 'gachi');

  // 🌟 追加：2回目プレイの専用アラート
  if (result && result.error === 'ALREADY_PLAYED') {
    alert('ガチコースは1度しか挑戦できません！ランキングで結果を確認しましょう！');
    window.location.href = 'ranking.html'; // 弾いてランキング画面に飛ばす！
    return;
  }

  if (!result?.success) return alert('通信エラーが発生しました。');

  // ② 届いたダンボール箱（result）から、整理券と問題データを取り出す！
  currentSessionId = result.sessionId;
  quizData = result.questions;

  // ③ 画面を一瞬で切り替えて、いざ第1問（index: 0）を表示！
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  
  displayQuestion(currentQuestionIndex); 

  // 🌟 タイマー起動！
  startTime = Date.now();
  timerInterval = setInterval(() => {
    // 経過ミリ秒を秒に変換
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    // 00:00 の形式（ゼロ埋め）にするプロの小技
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    
    // 画面のテキストだけを更新
    document.getElementById('timer-display').textContent = `⏱ ${m}:${s}`;
  }, 1000); // 1000ミリ秒（1秒）ごとに実行
});

// ==========================================
// 📺 3. 問題を画面に表示する関数
// ==========================================
function displayQuestion(index) {
  const q = quizData[index]; 
// 「第〇問」ではなく「〇 / 15 問目」として出力
  document.getElementById('question-progress').textContent = `${index + 1} / 15 問目`;
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
  button.addEventListener('click', async() => {

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

  clearInterval(timerInterval); // タイマーを止める
  
// ① 終了APIを叩く（スコア計算はサーバーにお任せ！）
  const result = await finishQuizSession(currentSessionId, 'gachi', currentScore);
  console.log('📦 APIからの返事:', result);

if (result && result.success) {
    // ② サーバーが計算した「正式なスコア」を結果画面に流し込む
    // ※ HTML側に <span id="final-score-display">0</span> がある前提です
    const scoreElement = document.getElementById('final-score-display');
    if (scoreElement) {
      scoreElement.textContent = result.finalScore;
    }

    // 🌟 追加：順位を画面に表示する！
    const rankElement = document.getElementById('rank-display');
    if (rankElement && result.rank) {
      rankElement.textContent = `全体 ${result.rank} 位！`;
    }

    // 🌟🌟🌟 ここを追加！名前を書き換える処理 🌟🌟🌟
    const userName = await getCurrentUserName();
    const nameElement = document.getElementById('player-name-display');
    if (nameElement) {
      nameElement.textContent = userName;
    }

    // ③ 画面をパッと切り替える！
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
  } else {
    alert('結果の保存に失敗しました。');
  }
}

// ==========================================
// 🚪 6. 画面遷移ボタンの処理（🌟 ここに書く！）
// ==========================================
// 👻 灰色の「戻るボタン」が押された時（待たずにすぐ移動！）
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
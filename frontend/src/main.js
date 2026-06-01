// frontend/src/main.js を上書き更新

import './style.css';
import { loginAndGetUserInfo, updateUserName } from './api.js';

async function initializeApp() {
  // 1. ロゴアニメーションを見せるための最低待機時間（2.5秒）
  const splashTimer = new Promise(resolve => setTimeout(resolve, 2500));
  
  // 2. その裏で、APIを叩いてユーザー情報を取得する
  const authPromise = loginAndGetUserInfo();

  // 3. 待機時間とAPI取得の両方が終わるまで待つ！
  const [_, result] = await Promise.all([splashTimer, authPromise]);

  // 4. スプラッシュ画面をフェードアウトさせる
  const splashScreen = document.getElementById('splash-screen');
  splashScreen.style.opacity = '0';

  // 0.5秒後（CSSのtransitionと同じ時間）に完全に非表示にして、次の画面へ
  setTimeout(() => {
    splashScreen.style.display = 'none';
    const authContainer = document.getElementById('auth-container');
    authContainer.style.display = 'block';
    
    handleAuthResult(result, authContainer);
  }, 500);
}

function handleAuthResult(result, container) {
  if (result && result.success) {
    if (result.requiresName) {
      // 🌟 名前未登録の場合：スマホ向けに調整した入力フォーム
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; padding: 20px; text-align: center;">
          <h2 style="margin-bottom: 10px; font-size: 24px;">ようこそ！</h2>
          <p style="margin-bottom: 30px; font-size: 14px; color: #666;">ランキングに表示する<br>プレイヤー名を入力してください</p>
          <input type="text" id="playerNameInput" placeholder="プレイヤー名" style="width: 100%; max-width: 300px; padding: 15px; font-size: 16px; margin-bottom: 20px; border: 2px solid #ddd; border-radius: 8px; outline: none;">
          <button id="submitNameBtn" style="width: 100%; max-width: 300px; padding: 15px; font-size: 16px; font-weight: bold; background-color: #2c3e50; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            登録して始める
          </button>
        </div>
      `;

      // 登録ボタンのイベント（以前のロジックと同じ）
      document.getElementById('submitNameBtn').addEventListener('click', async () => {
        const nameInput = document.getElementById('playerNameInput').value.trim();
        if (!nameInput) {
          alert('名前を入力してください！');
          return;
        }
        const btn = document.getElementById('submitNameBtn');
        btn.disabled = true;
        btn.textContent = '登録中...';

        const updateResult = await updateUserName(result.user.id, nameInput);
        if (updateResult.success) {
          window.location.href = 'course.html';
        } else {
          alert('名前の登録に失敗しました。');
          btn.disabled = false;
          btn.textContent = '登録して始める';
        }
      });

    } else {
      // 🌟 登録済みの場合：そのままコース選択画面へ直行！
      window.location.href = 'course.html';
    }
  } else {
    // 認証エラー時
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <h2>認証エラー</h2>
        <p>ログインに失敗しました。<br>ページをリロードしてください。</p>
      </div>
    `;
  }
}

// アプリ起動！
initializeApp();
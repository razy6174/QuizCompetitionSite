// frontend/src/main.js

import './style.css';
import { loginAndGetUserInfo, updateUserName } from './api.js'; // 👈 updateUserName を追加

async function checkAuthAndRedirect() {
  console.log('ログイン状態を確認中...');
  const result = await loginAndGetUserInfo();

  if (result && result.success) {
    // 🌟 名前が未登録の場合：入力フォームを表示！
    if (result.requiresName) {
      console.log('新規ユーザーです。名前入力画面を表示します。');
      
      document.querySelector('#app').innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; text-align: center;">
          <h2>ようこそ！</h2>
          <p>ランキングに表示するプレイヤー名を入力してください。</p>
          <input type="text" id="playerNameInput" placeholder="プレイヤー名" style="padding: 10px; font-size: 16px; margin: 15px 0; width: 80%; max-width: 300px;">
          <br>
          <button id="submitNameBtn" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 5px;">
            登録して始める
          </button>
        </div>
      `;

      // 登録ボタンが押された時の処理
      document.getElementById('submitNameBtn').addEventListener('click', async () => {
        const nameInput = document.getElementById('playerNameInput').value.trim();
        if (!nameInput) {
          alert('名前を入力してください！');
          return;
        }

        const btn = document.getElementById('submitNameBtn');
        btn.disabled = true;
        btn.textContent = '登録中...';

        // 名前をサーバーに保存
        const updateResult = await updateUserName(result.user.id, nameInput);
        
        if (updateResult.success) {
          // 登録成功したらコース選択画面へ！
          window.location.href = 'course.html';
        } else {
          alert('名前の登録に失敗しました。');
          btn.disabled = false;
          btn.textContent = '登録して始める';
        }
      });

    } else {
      // 🌟 名前がすでに登録されている場合：そのままコース選択へ直行！
      console.log(`おかえりなさい、${result.user.name}さん！コース選択画面へ移動します。`);
      window.location.href = 'course.html';
    }
    
  } else {
    document.querySelector('#app').innerHTML = `
      <div style="text-align: center; margin-top: 50px;">
        <h2>認証エラー</h2>
        <p>ログインに失敗しました。ページをリロードするか、再度アクセスし直してください。</p>
      </div>
    `;
    console.error('認証に失敗しました:', result);
  }
}

// 画面の初期表示
document.querySelector('#app').innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
    <h2>🔄 認証しています...</h2>
    <p>まもなくコース選択画面へ移動します</p>
  </div>
`;

checkAuthAndRedirect();
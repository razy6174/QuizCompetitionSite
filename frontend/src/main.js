// frontend/src/main.js

import './style.css'; // 全体のデザイン（CSS）だけは残しておく
import { loginAndGetUserInfo } from './api.js';

// 画面が表示されたらすぐに実行される関数
async function checkAuthAndRedirect() {
  console.log('ログイン状態を確認中...');

  // api.jsで作った「メアド取得＆バックエンド送信」の処理を呼び出す
  const result = await loginAndGetUserInfo();

  if (result && result.success) {
    console.log('認証成功！コース選択画面へ移動します。');
    // 🚀 自動遷移の魔法
    window.location.href = '/course.html';
  } else {
    // 認証に失敗した場合（Zero Trustを通っていないなど）のエラー画面表示
    document.querySelector('#app').innerHTML = `
      <div style="text-align: center; margin-top: 50px;">
        <h2>認証エラー</h2>
        <p>ログインに失敗しました。ページをリロードするか、再度アクセスし直してください。</p>
      </div>
    `;
    console.error('認証に失敗しました:', result);
  }
}

// 画面の初期表示（ローディング中）
document.querySelector('#app').innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
    <h2>🔄 認証しています...</h2>
    <p>まもなくコース選択画面へ移動します</p>
  </div>
`;

// スクリプトが読み込まれたら直ちに認証処理を実行
checkAuthAndRedirect();
import { loginAndGetUserInfo } from '../api.js';

// 今回クイズをする人のIDを保存しておくための「空の箱」を用意
let currentUserId = null;

// ① ページが開かれたら最初に実行される処理
async function init() {
  // バックエンドに話しかけてユーザー情報を取得（ここは本番でも必須！）
  const result = await loginAndGetUserInfo();

  if (result && result.success) {
    // 成功したら、後で使えるようにIDを箱に保存しておく！
    currentUserId = result.user.id; 
    console.log('準備完了：ユーザーID', currentUserId);
  } else {
    alert('ユーザー情報の取得に失敗しました。画面を再読み込みしてください。');
  }
}

// ページ読み込み完了時に init を実行
document.addEventListener('DOMContentLoaded', init);
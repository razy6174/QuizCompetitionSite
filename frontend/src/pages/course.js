// frontend/src/js/pages/course.js

console.log('★ course.js がブラウザに読み込まれました！');
import { loginAndGetUserInfo } from '../api.js';

async function init() {
  console.log('ページが読み込まれました。ログイン情報を確認します...');

  // ここでバックエンドに話しかける！
  const result = await loginAndGetUserInfo();

  if (result && result.success) {
    console.log('✅ ログイン成功！ユーザー情報:', result.user);
    // ここで「こんにちは、test@example.comさん！」といった表示を出すことも可能
  } else {
    console.log('❌ ログインに失敗したか、ユーザー情報が取得できませんでした。');
  }
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', init);
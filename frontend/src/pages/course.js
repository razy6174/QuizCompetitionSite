import { getCurrentUserId, getCurrentUserName } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userName = await getCurrentUserName();
  document.getElementById('header-user-name').textContent = userName;
});

let currentUserId = null;

async function init() {
  currentUserId = await getCurrentUserId();

  if (currentUserId) {
    console.log('準備完了：ユーザーID', currentUserId);
    return;
  }

  alert('ユーザー情報の取得に失敗しました。画面を再読み込みしてください。');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', init);
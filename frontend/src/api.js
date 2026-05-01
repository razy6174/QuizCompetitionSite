// src/api.js

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8787'
  : 'https://quizcompetitionsiteworkers.k-kazuyastrk.workers.dev';// バックエンドのURL';

// export をつけることで、他のファイル（course.jsなど）から呼び出せるようになります！
export async function loginAndGetUserInfo() {
  try {
    let emailQuery = '';

    // 本番環境（localhost以外）の場合のみ、Cloudflareの隠し機能からメアドを取得する
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const identityRes = await fetch('/cdn-cgi/access/get-identity');
      
      if (identityRes.ok) {
        const identity = await identityRes.json();
        // 取得したメアドをURLにくっつける準備（?email=〇〇）
        emailQuery = `?email=${identity.email}`;
      } else {
        console.warn('ユーザー情報が取得できません。Zero Trustを通っていない可能性があります。');
        return { success: false, error: 'Not authenticated' };
      }
    }

    // バックエンドにアクセス（emailQuery がある場合はURLの末尾に付与される）
    const response = await fetch(`${API_BASE_URL}/api/auth${emailQuery}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('API呼び出しに失敗しました:', error);
    return null;
  }
}
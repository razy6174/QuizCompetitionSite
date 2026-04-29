// src/api.js

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8787'
  : 'https://quizcompetitionsite.pages.dev/';// バックエンドのURL';

// export をつけることで、他のファイル（course.jsなど）から呼び出せるようになります！
export async function loginAndGetUserInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API呼び出しに失敗しました:', error);
    return null;
  }
}

// ※もし元々他のコードが書いてあった場合は、消さずに一番下などに追記してください。
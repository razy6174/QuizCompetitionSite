const USER_CACHE_KEY = 'quizUserInfo';

export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8787'
  : 'https://quizcompetitionsiteworkers.k-kazuyastrk.workers.dev';

function getCachedUserInfo() {
  const raw = sessionStorage.getItem(USER_CACHE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCachedUserInfo(data) {
  sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
}

export async function loginAndGetUserInfo() {
  try {
    const cached = getCachedUserInfo();
    if (cached) {
      return cached;
    }

    let emailQuery = '';
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const identityRes = await fetch('/cdn-cgi/access/get-identity');
      if (!identityRes.ok) {
        return { success: false, error: 'Not authenticated' };
      }
      const identity = await identityRes.json();
      emailQuery = `?email=${identity.email}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth${emailQuery}`);
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    if (data.success) {
      setCachedUserInfo(data);
    }
    return data;

  } catch (error) {
    console.error('API呼び出しに失敗しました:', error);
    return null;
  }
}

export async function getCurrentUserId() {
  const data = await loginAndGetUserInfo();
  return data?.success ? data.user.id : null;
}

// 🌟 統合版：クイズ開始＆問題取得API
export async function startQuizAndGetQuestions(userId, course) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/start-quiz/${course}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId })
    });
    
    return await response.json();
  } catch (error) {
    console.error('クイズ開始APIエラー:', error);
    return { success: false, error: '通信エラーが発生しました' };
  }
}

// 解答をバックエンドに送信する関数
export async function submitQuizAnswer(sessionId, questionId, selectedChoice) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: sessionId, 
        questionId: questionId, 
        selectedChoice: selectedChoice // 'A', 'B', 'C', 'D' のいずれか
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('解答送信エラー:', error);
    return { success: false, error: '通信エラー' };
  }
}

// 🌟 クイズ終了をバックエンドに伝える関数
export async function finishQuizSession(sessionId, course) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finish-quiz/${course}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId }) // 💡 スコアは送らない！IDだけ！
    });
    
    return await response.json();
  } catch (error) {
    console.error('終了APIエラー:', error);
    return { success: false, error: '通信エラーが発生しました' };
  }
}
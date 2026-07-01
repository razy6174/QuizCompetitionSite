const USER_CACHE_KEY = 'quizUserInfo';
const USER_EMAIL_KEY = 'userEmail';

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

function getStoredEmail() {
  return localStorage.getItem(USER_EMAIL_KEY);
}

function storeEmail(email) {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

function clearStoredEmail() {
  localStorage.removeItem(USER_EMAIL_KEY);
}

function validateEmail(email) {
  const normalized = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized);
}

export async function loginAndGetUserInfo(providedEmail = null) {
  try {
    const cached = getCachedUserInfo();
    if (cached) {
      return cached;
    }

    let email = providedEmail || getStoredEmail();
    if (!email) {
      return { success: false, needsEmail: true };
    }

    email = email.trim().toLowerCase();
    if (!validateEmail(email)) {
      clearStoredEmail();
      return { success: false, invalidEmail: true, error: 'メールアドレスの形式が正しくありません。' };
    }

    const response = await fetch(`${API_BASE_URL}/api/auth?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      if (response.status === 401) {
        clearStoredEmail();
        return { success: false, needsEmail: true, error: 'メールアドレスの入力が必要です。' };
      }
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data.success) {
      storeEmail(email);
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

// 🌟 現在のユーザー名を取得する関数（名前がなければ「あなた」を返す）
export async function getCurrentUserName() {
  const data = await loginAndGetUserInfo();
  return data?.success && data.user.name ? data.user.name : 'あなた';
}

// 🌟 名前を登録・更新する関数
export async function updateUserName(userId, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/update-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, name: name })
    });
    
    const data = await response.json();

    if (data.success) {
      // 💡 成功したら、ローカルのキャッシュ情報も書き換える！
      const cached = getCachedUserInfo();
      if (cached && cached.user) {
        cached.user.name = name;
        cached.requiresName = false;
        setCachedUserInfo(cached);
      }
    }
    
    return data;
  } catch (error) {
    console.error('名前更新エラー:', error);
    return { success: false };
  }
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
export async function finishQuizSession(sessionId, course, score = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finish-quiz/${course}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId, course: course, score: score })
    });
    
    return await response.json();
  } catch (error) {
    console.error('終了APIエラー:', error);
    return { success: false, error: '通信エラーが発生しました' };
  }
}

// 🌟 ランキングデータを取得する関数
// （引数を指定しなければ、自動的にTOP50を取得します）
export async function getRanking(limit = 50, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ranking?limit=${limit}&offset=${offset}`);
    return await response.json();
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    return { success: false, error: '通信エラーが発生しました' };
  }
}
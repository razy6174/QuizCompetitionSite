// backend/src/index.js
import { handleUserAuth } from './handlers/user.js';
import { handleStartSession } from './handlers/session.js';
import { handleGetQuestions } from './handlers/quiz.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // リクエストされたURLが「/api/auth」だった場合、user.jsの処理を呼び出す
    if (url.pathname === '/api/auth' && request.method === 'GET') {
      return handleUserAuth(request, env);
    }

    // 他のURLの処理... (quiz.js などへ)
    if (url.pathname === '/api/start-session' && request.method === 'POST') {
      return handleStartSession(request, env);
    }

    if (url.pathname === '/api/questions' && request.method === 'GET') {
      return await handleGetQuestions(request, env);
    }

    // 該当するAPIがない場合
    return new Response('Not Found', { status: 404 });
  }
};
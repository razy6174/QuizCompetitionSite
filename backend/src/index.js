// backend/src/index.js
import { handleUserAuth } from './handlers/user.js';
import { handleStartQuizAndGetQuestions, handleFinishQuiz} from './handlers/session.js';
import { handleSubmitAnswer } from './handlers/answer.js';


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

    // 🌟 統合APIへの案内（ガチとエンジョイ）
    if (url.pathname === '/api/start-quiz/gachi' && request.method === 'POST') {
      return handleStartQuizAndGetQuestions(request, env, 'gachi');
    }

    if (url.pathname === '/api/start-quiz/enjoy' && request.method === 'POST') {
      return handleStartQuizAndGetQuestions(request, env, 'enjoy');
    }

    // 🌟 解答を送信するAPI
    if (url.pathname === '/api/submit-answer' && request.method === 'POST') {
      return handleSubmitAnswer(request, env);
    }

    // 🌟 2. 終了APIのルーティングを追加
    if (url.pathname === '/api/finish-quiz/gachi' && request.method === 'POST') {
      return handleFinishQuiz(request, env, 'gachi');
    }

    if (url.pathname === '/api/finish-quiz/enjoy' && request.method === 'POST') {
      return handleFinishQuiz(request, env, 'enjoy');
    }

    // 該当するAPIがない場合
    return new Response('Not Found', { status: 404 });
  }
};
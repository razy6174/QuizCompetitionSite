/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

//export default {
	//async fetch(request, env, ctx) {
		//return new Response("Hello World!");
	//},
//};

// backend/src/index.js
import { handleUserAuth } from './handlers/user.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // リクエストされたURLが「/api/auth」だった場合、user.jsの処理を呼び出す
    if (url.pathname === '/api/auth' && request.method === 'GET') {
      return handleUserAuth(request, env);
    }

    // 他のURLの処理... (quiz.js などへ)
    
    // 該当するAPIがない場合
    return new Response('Not Found', { status: 404 });
  }
};
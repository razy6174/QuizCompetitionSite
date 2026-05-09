// backend/src/handlers/session.js

export async function handleStartSession(request, env) {
  // POST通信（データを送る通信）以外は弾く
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // フロントエンドから送られてきたユーザーIDを受け取る
    const { userId, start_time } = await request.json();

    // データベースに記録し、同時に作られた session_id と start_time を返してもらう（RETURNING）
    const { results } = await env.DB.prepare(
      'INSERT INTO play_sessions (user_id, start_time) VALUES (?, ?) RETURNING id, start_time'
    ).bind(userId, start_time).all();

    const newSession = results[0];

    // フロントエンドに「成功したよ！これが今回のセッションIDだよ！」と返す
    return new Response(JSON.stringify({ success: true, session: newSession }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('セッション開始エラー:', error);
    return new Response(JSON.stringify({ error: 'Failed to start session', details: error.message }), 
    { status: 500, headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // 👈 これがないとブラウザがパニックになる！
      }});
  }
}
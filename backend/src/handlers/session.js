// backend/src/handlers/session.js
export async function handleStartSession(request, env) {
  // POST通信以外は弾く
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // ⚠️ 修正ポイント1：フロントからは userId "だけ"を受け取る！
    const { userId } = await request.json();

    // 🌟 変更後（日本時間 JST で記録する）
    const serverStartTime = new Date().toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-'); // 形式を "YYYY-MM-DD HH:MM:SS" に整える

    // データベースに記録し、同時に作られた id と start_time を返してもらう（RETURNING）
    const { results } = await env.DB.prepare(
      'INSERT INTO play_sessions (user_id, start_time) VALUES (?, ?) RETURNING id, start_time'
    ).bind(userId, serverStartTime).all();

    const newSession = results[0];

    // フロントエンドに「成功したよ！これが今回のセッション情報だよ！」と返す
    return new Response(JSON.stringify({ success: true, session: newSession }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('セッション開始エラー:', error);
    return new Response(JSON.stringify({ error: 'Failed to start session', details: error.message }), 
    { 
      status: 500, 
      headers: { 'Content-Type': 'application/json','Access-Control-Allow-Origin': '*' } // 👈 これがないとブラウザがパニックになる！
    });
  }
}
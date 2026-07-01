// backend/src/handlers/user.js

export async function handleUserAuth(request, env) {
  const url = new URL(request.url);
  const guestId = url.searchParams.get('email') || request.headers.get('x-guest-id');

  if (!guestId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    // ② データベース（D1）からユーザーを探す
    // ※ env.DB の部分は、wrangler.jsonc で設定したD1のバインディング名に合わせてください
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(guestId).all();

    let user = results[0];

    // ③ ユーザーが存在しなかったら新規登録する
    if (!user) {
      const serverCreatedAt = new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-');

      const newUser = await env.DB.prepare(
        'INSERT INTO users (email, created_at) VALUES (?, ?) RETURNING *'
      ).bind(guestId, serverCreatedAt).first();
      
      user = newUser;
      console.log('新規ユーザーを登録しました:', guestId);
    } else {
      console.log('既存ユーザーがログインしました:', guestId);
    }

// 🌟 追加：名前が未登録（nullや空文字）かどうかを判定
    const requiresName = !user.name;

    return new Response(JSON.stringify({ 
      success: true, 
      user: user, 
      requiresName: requiresName // 👈 フロントエンドに教える！
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// 🌟 新規追加：名前をアップデートするAPI
export async function handleUpdateName(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { userId, name } = await request.json();

    await env.DB.prepare(
      'UPDATE users SET name = ? WHERE id = ?'
    ).bind(name, userId).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('名前更新エラー:', error);
    return new Response(JSON.stringify({ success: false, error: 'サーバーエラー' }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
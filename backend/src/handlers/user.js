// backend/src/handlers/user.js

export async function handleUserAuth(request, env) {
  // ① Zero Trustのヘッダーからメールアドレスを取得
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');

  // ローカル開発用のフォールバック（手元でテストする用）
  const userEmail = email || 'test@example.com'; 

  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // ② データベース（D1）からユーザーを探す
    // ※ env.DB の部分は、wrangler.jsonc で設定したD1のバインディング名に合わせてください
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(userEmail).all();

    let user = results[0];

    // ③ ユーザーが存在しなかったら新規登録する
    if (!user) {
      const newUser = await env.DB.prepare(
        'INSERT INTO users (email) VALUES (?) RETURNING *'
      ).bind(userEmail).first();
      
      user = newUser;
      console.log('新規ユーザーを登録しました:', userEmail);
    } else {
      console.log('既存ユーザーがログインしました:', userEmail);
    }

    // ④ フロントエンドに結果を返す
    return new Response(JSON.stringify({ success: true, user: user }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
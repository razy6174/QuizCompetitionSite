// backend/src/handlers/session.js

export async function handleStartQuizAndGetQuestions(request, env, course) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { userId } = await request.json();
    
    // 最後にフロントエンドに返すための「空箱」を先に用意しておく
    let newSessionId;
    let quizResults;

    // 🌟 ここから if文 で「ガチ」と「エンジョイ」の処理を完全に分ける！
    if (course === 'gachi') {
      // ==============================
      // 🔥 ガチコースの処理
      // ==============================
      
      // ガチコース専用：日本時間の時刻を取得
      const serverStartTime = new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-');

      // ① ガチ用のテーブルに、ユーザーIDと「開始時刻」を記録する！
      const { results: sessionResults } = await env.DB.prepare(
        'INSERT INTO gachi_sessions (user_id, start_time) VALUES (?, ?) RETURNING id'
      ).bind(userId, serverStartTime).all();
      newSessionId = sessionResults[0].id;

      // ② ガチの問題（course_type = 'gachi'）をランダムに15問持ってくる！
      const { results: qResults } = await env.DB.prepare(
        'SELECT * FROM questions WHERE course_type = ? ORDER BY RANDOM() LIMIT 15'
      ).bind('gachi').all();
      quizResults = qResults;

    } else if (course === 'enjoy') {
      // ==============================
      // 🌸 エンジョイコースの処理
      // ==============================
      
      // ① エンジョイ用のテーブルに「ユーザーIDだけ」を記録する！（※時間を測らないため）
      const { results: sessionResults } = await env.DB.prepare(
        'INSERT INTO enjoy_sessions (user_id) VALUES (?) RETURNING id'
      ).bind(userId).all();
      newSessionId = sessionResults[0].id;

      // ② エンジョイの問題（course_type = 'enjoy'）をランダムに持ってくる！
      // （※もしエンジョイコースを10問で終わらせたい場合は、LIMIT 15 を LIMIT 10 に変更してください）
      const { results: qResults } = await env.DB.prepare(
        'SELECT * FROM questions WHERE course_type = ? ORDER BY RANDOM() LIMIT 15'
      ).bind('enjoy').all();
      quizResults = qResults;
    }

    // ③ 整理券と問題データを1つのダンボール箱に詰めて、フロントエンドに送り返す！
    return new Response(JSON.stringify({ 
      success: true, 
      sessionId: newSessionId, 
      questions: quizResults 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('クイズ開始＆取得エラー:', error);
    // ついでにエラーの真犯人(details)もフロントに送るようにしておきます！
    return new Response(JSON.stringify({ success: false, error: '通信エラー', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// ↓↓↓ これを session.js の一番下に追記する ↓↓↓

export async function handleFinishQuiz(request, env, course) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { sessionId, score } = await request.json();

    if (course === 'gachi') {
      // ガチコース：終了時間とスコアを両方記録する
      const serverEndTime = new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-');

      await env.DB.prepare(
        'UPDATE gachi_sessions SET end_time = ?, score = ? WHERE id = ?'
      ).bind(serverEndTime, score, sessionId).run();

    } else if (course === 'enjoy') {
      // エンジョイコース：時間はいらないので、スコアだけ記録する
      await env.DB.prepare(
        'UPDATE enjoy_sessions SET score = ? WHERE id = ?'
      ).bind(score, sessionId).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('クイズ終了記録エラー:', error);
    return new Response(JSON.stringify({ success: false, error: '通信エラー', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
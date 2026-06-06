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
      // （＊前半１４問から５問、後半１０問から５問）
      const { results: qResults } = await env.DB.prepare(`
        SELECT * FROM (
          SELECT * FROM questions 
          WHERE course_type = ? AND image_url IS NOT NULL 
          ORDER BY RANDOM() LIMIT 5
        )
        UNION ALL
        SELECT * FROM (
          SELECT * FROM questions 
          WHERE course_type = ? AND image_url IS NULL 
          ORDER BY RANDOM() LIMIT 5
        )
      `).bind('enjoy', 'enjoy').all();
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

// backend/src/handlers/session.js の一番下

export async function handleFinishQuiz(request, env, course) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { sessionId, score } = await request.json();
    let finalScore = 0;
    let currentRank = null; // 🌟 自分の順位を入れる箱を追加！

    if (course === 'gachi') {
      // 1. スコア計算
      const correctData = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM answers WHERE gachi_session_id = ? AND is_correct = 1'
      ).bind(sessionId).first();
      finalScore = correctData.count;

      const serverEndTime = new Date().toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).replace(/\//g, '-');

      // 2. スコアと終了時間を保存
      await env.DB.prepare(
        'UPDATE gachi_sessions SET end_time = ?, score = ? WHERE id = ?'
      ).bind(serverEndTime, finalScore, sessionId).run();

      // 🌟 3. 【新規追加】自分の順位を計算する最強のSQL！
      // 自分より「点数が高い人」または「同点だけどタイムが短い人」の数を数えて +1 します。
      const rankData = await env.DB.prepare(`
        SELECT (
          SELECT COUNT(*) + 1
          FROM gachi_sessions as Other
          WHERE Other.end_time IS NOT NULL AND (
            Other.score > Current.score
            OR (
              Other.score = Current.score AND 
              (julianday(Other.end_time) - julianday(Other.start_time)) < (julianday(Current.end_time) - julianday(Current.start_time))
            )
          )
        ) as rank
        FROM gachi_sessions as Current
        WHERE Current.id = ?
      `).bind(sessionId).first();

      currentRank = rankData ? rankData.rank : null;

    } else if (course === 'enjoy') {
      finalScore = score;
      await env.DB.prepare(
        'UPDATE enjoy_sessions SET score = ? WHERE id = ?'
      ).bind(finalScore, sessionId).run();
    }

    // 🌟 4. 返事に rank も追加してあげる！
    return new Response(JSON.stringify({ 
      success: true,
      finalScore: finalScore,
      rank: currentRank // エンジョイコースの場合は null が返ります
    }), {
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
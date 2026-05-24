// backend/src/handlers/session.js



export async function handleStartQuizAndGetQuestions(request, env, course) {

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });



  try {

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

   

    // 💡 コースに応じて書き込むテーブル名を変える

    const tableName = course === 'gachi' ? 'gachi_sessions' : 'enjoy_sessions';



    // ① まず開始時間を記録し、整理券（id）をもらう！

    const { results: sessionResults } = await env.DB.prepare(

      `INSERT INTO ${tableName} (user_id, start_time) VALUES (?, ?) RETURNING id`

    ).bind(userId, serverStartTime).all();



    const newSessionId = sessionResults[0].id;



    // ② 次に、指定されたコースの問題をランダムに15問取得する！

    const { results: quizResults } = await env.DB.prepare(

      'SELECT * FROM questions WHERE course_type = ? ORDER BY RANDOM() LIMIT 15'

    ).bind(course).all();



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

    return new Response(JSON.stringify({ success: false, error: '通信エラー' }), {

      status: 500,

      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

    });

  }

}
// backend/src/handlers/answer.js

export async function handleSubmitAnswer(request, env) {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    try {
    // フロントエンドから 送信されるデータ（誰が、どの問題に、何を選んだか）
    const { sessionId, questionId, selectedChoice } = await request.json();

    // 🛡️ ① 【連打対策】すでにこのセッション・この問題の解答が存在するかチェック！
    const existingAnswer = await env.DB.prepare(
        'SELECT id FROM answers WHERE gachi_session_id = ? AND question_id = ?'
    ).bind(sessionId, questionId).first();

    if (existingAnswer) {
      // すでに解答済みなら、エラーにせず「成功」として返す（連打された通信を安全にスルーする）
        return new Response(JSON.stringify({ success: true, message: 'Already answered' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    // ⚖️ ② 正誤判定のために、DBからこの問題の「本当の正解」を取得する
    const question = await env.DB.prepare(
        'SELECT correct_choice FROM questions WHERE id = ?'
    ).bind(questionId).first();

    if (!question) {
        return new Response(JSON.stringify({ success: false, error: '問題が見つかりません' }), { status: 404 });
    }

    // 💡 ③ 正誤判定（DBの正解と、ユーザーが選んだ選択肢が一致しているか）
    // 一致していれば 1 (正解)、違っていれば 0 (不正解)
    const isCorrect = question.correct_choice === selectedChoice ? 1 : 0;

    // 💾 ④ answers テーブルに記録を保存！
    await env.DB.prepare(
        'INSERT INTO answers (gachi_session_id, question_id, selected_choice, is_correct) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, questionId, selectedChoice, isCorrect).run();

    // 📤 ⑤ 結果（正解だったかどうか）をフロントエンドに返す
    return new Response(JSON.stringify({ 
        success: true, 
        isCorrect: isCorrect === 1, 
        correctChoice: question.correct_choice 
    }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

    } catch (error) {
    console.error('解答保存エラー:', error);
    return new Response(JSON.stringify({ success: false, error: 'サーバーエラー' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    }
}
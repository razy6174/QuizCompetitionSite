// backend/src/handlers/ranking.js

export async function handleGetRanking(request, env) {
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });

    const url = new URL(request.url);
  // 引数で limit（何件表示するか）と offset（何件飛ばすか）を受け取る（デフォルトは50件表示）
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    try {
    // users テーブルと gachi_sessions テーブルを合体（JOIN）させて、名前も一緒に取得する！
    // タイムは julianday の差分に 86400（1日の秒数）を掛けて「秒」に変換しています。
        const { results } = await env.DB.prepare(`
        SELECT 
        u.name,
        g.score,
        CAST((julianday(g.end_time) - julianday(g.start_time)) * 86400 AS INTEGER) as time_seconds
        FROM gachi_sessions g
        JOIN users u ON g.user_id = u.id
        WHERE g.end_time IS NOT NULL
        ORDER BY 
        g.score DESC, 
        time_seconds ASC
        LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    return new Response(JSON.stringify({ 
        success: true, 
        ranking: results 
    }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

    } catch (error) {
    console.error('ランキング取得エラー:', error);
    return new Response(JSON.stringify({ success: false, error: 'サーバーエラー' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    }
}
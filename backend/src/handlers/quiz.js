// backend/src/handlers/quiz.js のイメージ
export async function handleGetQuestions(request, env) {
  // SQLでデータをごっそり取ってくる
  const { results } = await env.DB.prepare(
    'SELECT * FROM questions ORDER BY RANDOM() LIMIT 15' // ランダムに15問選ぶ
  ).all();

  return new Response(JSON.stringify(results), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' 
    }
  });
}
-- ① 既存のテーブルがあれば一旦削除する（作り直しやすいようにするおまじない）
-- ※外部キー（紐付け）の都合上、子供のテーブルから順番に削除します
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS play_sessions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

-- ② users（参加者）テーブルの作成
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- 自動で割り振られる参加者番号
    email TEXT UNIQUE NOT NULL,           -- Microsoftのメールアドレス（重複禁止）
    name TEXT,                            -- ユーザー名
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 初めてログインした日時
);

-- ③ play_sessions（プレイ記録）テーブルの作成
CREATE TABLE play_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- プレイごとの通し番号
    user_id INTEGER NOT NULL,             -- 誰がプレイしたか（usersのidと紐づく）
    start_time DATETIME NOT NULL,         -- クイズを開始した時刻
    end_time DATETIME,                    -- クイズを終了した時刻
    score INTEGER DEFAULT 0,              -- スコア（初期値は0）
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ④ questions（クイズの問題）テーブルの作成
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- 問題番号
    question_text TEXT NOT NULL,          -- 問題文
    choice_a TEXT NOT NULL,               -- 選択肢A
    choice_b TEXT NOT NULL,               -- 選択肢B
    choice_c TEXT NOT NULL,               -- 選択肢C
    choice_d TEXT NOT NULL,               -- 選択肢D
    correct_choice TEXT NOT NULL,         -- 正解の選択肢（'A', 'B', 'C', 'D' のいずれかを入れる想定）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ⑤ answers（解答履歴）テーブルの作成
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- 解答履歴の通し番号
    play_session_id INTEGER NOT NULL,     -- どのプレイ（1回のゲーム）での解答か
    question_id INTEGER NOT NULL,         -- どの問題に対する解答か
    selected_choice TEXT NOT NULL,        -- ユーザーが選んだ選択肢（'A', 'B', 'C', 'D'）
    is_correct INTEGER NOT NULL,          -- 正解したかどうか（1:正解, 0:不正解）
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 解答した時刻
    FOREIGN KEY (play_session_id) REFERENCES play_sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
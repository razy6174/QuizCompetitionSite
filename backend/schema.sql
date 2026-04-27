-- ① 既存のテーブルがあれば一旦削除する（作り直しやすいようにするおまじない）
DROP TABLE IF EXISTS play_sessions;
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
    FOREIGN KEY (user_id) REFERENCES users(id) -- usersテーブルとの連携ルール
);
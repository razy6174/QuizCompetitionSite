// frontend/vite.config.js

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // ここに本番環境でも使いたいHTMLファイルをすべて登録します
        main: resolve(__dirname, 'index.html'),
        course: resolve(__dirname, 'course.html'),
        gachi: resolve(__dirname, 'gachi.html'),
        enjoy: resolve(__dirname, 'enjoy.html'),
        
        // ※今後以下のページを作ったら、ここに追加していけばOKです！
        // quiz: resolve(__dirname, 'quiz.html'),
        // survey: resolve(__dirname, 'survey.html'),
        // result: resolve(__dirname, 'result.html'),
        // ranking: resolve(__dirname, 'ranking.html'),
      }
    }
  }
});
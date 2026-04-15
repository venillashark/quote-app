# 水電工程估價單 v2

純前端版本，無需後端，可直接部署到 Vercel。

## 本機開發

```bash
npm install
npm run dev
# 開啟 http://localhost:5173
```

## 部署到 Vercel（讓別人直接用網址開啟）

### 方法一：GitHub + Vercel（推薦）

1. 在 GitHub 建立一個新的 repository（免費帳號即可）
2. 把這個資料夾推上去：
   ```bash
   git init
   git add .
   git commit -m "init"
   git remote add origin https://github.com/你的帳號/quote-app.git
   git push -u origin main
   ```
3. 到 https://vercel.com 用 GitHub 登入
4. 點「Add New Project」→ 選你的 repository
5. Framework 選 **Vite**，其他設定不用改
6. 點「Deploy」，幾秒後取得網址，分享給任何人即可使用

### 方法二：Vercel CLI 直接上傳

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 功能說明

| 功能 | 說明 |
|------|------|
| 自動儲存 | 每次編輯後 0.8 秒自動存到瀏覽器，工具列有綠點閃爍指示 |
| ⬇ 匯出存檔 | 把目前估價單存成 `.json` 檔，可在不同電腦匯入 |
| ⬆ 匯入 | 匯入之前存的 `.json` 估價單 |
| 📊 匯出 Excel | 產生彩色精美的 `.xlsx` 檔 |
| 🖨 列印 / PDF | 瀏覽器列印，版面與網頁完全一致，可存成 PDF |

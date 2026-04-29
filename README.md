# AI2 教練（網頁版）

這是一個給 **中學生 App Inventor 課程**使用的引導式 AI 教練範本。

## 對應你的三個需求

1. **上傳 AI2 原始檔或截圖**
   - 支援上傳 `.aia` 與圖片附件（目前先記錄檔名，可再擴充後端解析）。
2. **串接自己的免費 AI**
   - 可自訂 API Base URL、模型名稱與 API Key。
   - 預設填入 OpenRouter 免費模型範例。
3. **記錄學習任務**
   - 每次任務會寫入 `localStorage`（時間、任務名稱、狀態）。

## 在 GitHub 專案中如何測試 `index.html`

## 看不到網頁？先做這 4 步

1. 確認你把檔案 push 到 **GitHub repo 的 `main` 分支**。
2. 到 **Settings → Pages**，Source 選 **GitHub Actions**。
3. 到 **Actions** 分頁，確認 `Deploy static site to GitHub Pages` 成功（綠色勾勾）。
4. 成功後打開：`https://<你的帳號>.github.io/<repo名>/`。

若還看不到：
- 先等 1~3 分鐘再重整。
- 確認 repo 不是 private（free 帳號下 private repo 可能有限制）。
- 確認 URL 的 repo 名大小寫正確。


你已經串接 GitHub，建議有 3 種測試方式：

### 方式 A：GitHub Pages（最像正式上線）
1. 進入你的 repo → **Settings** → **Pages**。
2. **Build and deployment** 選 `Deploy from a branch`。
3. Branch 選 `main`（或你要的分支）/ folder 選 `/ (root)`。
4. 按 Save，等待 1~3 分鐘。
5. 打開產生的網址（例如 `https://<你的帳號>.github.io/<repo名>/`）。
6. 在該網址上依照下方「老師版測試清單」逐步測試。

> 注意：本專案會呼叫外部 AI API，請確認你的 API 供應商允許從瀏覽器端呼叫（CORS）。

### 方式 B：GitHub Codespaces（雲端開發環境）
1. 在 repo 首頁按 **Code** → **Codespaces** → **Create codespace**。
2. 在 Terminal 執行：
   ```bash
   python3 -m http.server 8080
   ```
3. 將 8080 port 設為 Public（或使用自動轉發網址）。
4. 開啟預覽網址並進行測試。

### 方式 C：本機 clone 測試（最快）
1. `git clone` 你的 repo。
2. 進到專案資料夾後執行：
   ```bash
   python3 -m http.server 8080
   ```
3. 開啟 `http://localhost:8080`。


### 如果 Deploy 顯示紅色失敗（Failed to deploy）
1. 點進 **Actions** → 失敗那次 workflow。
2. 展開失敗 step 的 log（常見是 artifact 路徑或 Pages 設定）。
3. 到 **Settings → Pages**，確認 Source 是 **GitHub Actions**。
4. 重新執行 workflow：Actions 頁面按 **Re-run all jobs**。

本專案目前會先把 `index.html / app.js / styles.css` 打包到 `dist/` 再部署，避免把整個 repo 上傳造成部署失敗。

## 快速開始

### 方法 A（最簡單）
直接用瀏覽器開啟 `index.html`。

### 方法 B（建議）
使用本機靜態伺服器啟動，避免部分瀏覽器對本地檔案限制：

```bash
python3 -m http.server 8080
```

然後開啟：

`http://localhost:8080`

## 如何測試（老師版檢查清單）

> 目標：確認「可上傳、可呼叫 AI、可引導、可紀錄」。

### 1) 設定區測試
1. 在「API Base URL」輸入你的服務端點（例如 OpenRouter）。
2. 輸入免費模型名稱與 API Key。
3. 按「儲存設定」應看到「✅ 設定已儲存」。
4. 按「測試連線」後，聊天區應出現教練自我介紹；若失敗，會顯示 `連線失敗：HTTP xxx`。

### 2) 檔案上傳測試
1. 任務名稱輸入：`按鈕點擊後 Label 沒更新`。
2. 問題描述輸入：`我按了按鈕但文字沒變，我有設定事件。`。
3. 附件選一個 `.aia` 檔 + 一張錯誤截圖。
4. 按「開始引導」後，聊天區應顯示「任務/問題/附件檔名」。

### 3) 引導品質測試（重點）
檢查 AI 回覆是否符合：
- 不直接給答案或說「第幾行錯」。
- 先肯定學生，再提出 1~3 個引導問題。
- 問題具體可操作（例如檢查事件觸發、變數值、元件屬性）。
- 最後有「下一步小任務」。

### 4) 任務紀錄測試
1. 開始至少 2 個任務。
2. 觀察「學習任務紀錄」是否有時間、任務名稱、狀態。
3. 重新整理頁面後，紀錄應保留（`localStorage`）。

### 5) 常見錯誤排查
- 顯示 `連線失敗：HTTP 401`：API Key 不正確。
- 顯示 `連線失敗：HTTP 404`：API Base URL 可能錯誤（路徑需含 `/chat/completions`）。
- 顯示 `連線失敗：HTTP 429`：超過免費額度或速率限制。
- 顯示 CORS 錯誤：AI 平台可能不允許瀏覽器端直連，需改成後端代理。
- 沒有回覆內容：模型名稱可能不支援或配額不足。

## README 測試步驟完整性檢核（本次補強）

目前 README 已覆蓋：
- 執行環境（GitHub Pages / Codespaces / 本機）
- 核心功能驗證（設定、上傳、引導、紀錄）
- 常見錯誤與排查（401/404/429/CORS）

若要再更完整，可再加：
- 「預期回覆範例」：幫助助教快速判斷引導品質。
- 「班級測試資料包」：固定的 `.aia` + 截圖，讓不同老師測得一致。
- 「回歸測試表單」：每次改版都能逐項打勾。

## 建議課堂評分指標（可選）

每位學生每次除錯可記錄：
- 是否能描述「觀察到的現象」
- 是否能提出至少 1 個假設
- 是否完成 AI 提供的下一步小任務
- 是否能自行修正而非直接索取答案

## 下一步可擴充

- 新增後端（Node/Flask）接收檔案，解壓 `.aia` 後分析 blocks/scm。
- 增加「教師模式」查看班級常見錯誤類型。
- 匯出學習歷程（CSV / Google Sheets）。

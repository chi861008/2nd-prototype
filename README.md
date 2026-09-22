# 日常茶事｜顧客顯示器 Prototype

餐飲櫃台資訊層級研究用的灰階互動原型。沿用工作區 Next.js 16.3.5、React 19、TypeScript，無資料庫或金流服務。

## 啟動

需要 Node.js 22.6 以上（本次使用 24.21），建議使用 npm。
```powershell
npm.cmd install
npm.cmd run dev
```
開啟 http://localhost:3000 。首頁會轉到並排預覽。

- /control：店員 POS、研究情境與行銷素材設定。
- /display：獨立顧客顯示器；將視窗移到第二螢幕並全螢幕顯示。
- /preview：可操作控制台與 iframe 顧客端並排；可選 1366×768、1920×1080、1194×834 模擬畫布，等比縮小以供單螢幕觀察。

正式模式：先執行 `npm.cmd run build`，再執行 `npm.cmd start`。請使用同一個 origin 開啟所有視窗（不要混用 localhost 與 127.0.0.1）。

## 操作與研究

1. 按「開始新訂單」，由商品目錄加入單品或套餐。
2. 每列「編輯」可改名稱、數量、規格、加料、備註、單品折扣及招待；修改會在顧客端帶看並標示約 1.8 秒。
3. 「帶看品項」可由店員回查長訂單；顧客端不需點擊、展開或捲動，也不循環自動捲動。
4. 設定會員、發票及整單折扣。統編與載具用 discriminated union 共用單一欄位，因此互斥；會員獨立存在。
5. 確認訂單後進入付款，可逐筆加入現金、信用卡或行動支付。非現金不得超收；現金可溢付，顯示找零。
6. 可取消單筆收款、重設收款，或取消付款回點餐（清除所有收款）。
7. 收齊才可完成付款；5 秒後返回行銷頁。在期限內開始新訂單會立即清除舊倒數。
8. 研究頁籤提供 13 個可重複載入情境、暫停／繼續倒數、立即返回行銷頁與重設全部狀態。情境 13 在 2.5 秒後模擬下一單。

顧客端維持左側行銷、右側交易架構，明細獨立捲動，摘要固定。付款完成採全畫面確認。
情境載入是研究快捷入口；所有交易階段也可由 POS 實際操作到達。

## 研究依據與假設

已檢視提供的 Frame 16.png（洞察／HMW）、Frame 11.png（競品）、設計方向.png 與 phototype 修正.svg。
採用「先看總額，再查差異」的層級：總計 → 數量／總折扣／招待 → 會員與發票 → 完整商品階層。
SVG 用於理解主商品、子項、規格及加價的歸屬，沒有沿用紙本密集排版。
所有需求衝突以建置指令為準，不加入觸控操作或循環捲動。

- 金額皆為含稅整數新台幣，無稅率、服務費、百分比折扣、退款或真實金流。
- 商品基價加上主項／套餐子項加料後乘以數量；單品折扣作用於整列，再扣整單折扣。折扣最高為可折抵餘額，不產生負數。
- 套餐價格已包含子餐點，子項只追加加料費。數量是主訂購單位，套餐計 1 項；子品項不重複計數。
- 招待金額與折扣分開：顧客端保留原價、標示招待及實付 0，摘要顯示招待數量。
- 大／中杯、甜度、冰量是研究文字設定，價格不隨尺寸改變；加料每份 NT$10。
- 會員是虛構測試會員，可設定或清除；統編／載具不做正式格式與稅務驗證。請勿輸入真實受測者個資。
- 完成畫面顯示實收各筆付款與找零；實收合計減找零等於訂單總額。
- 一個主要控制台寫入。多個顧客視窗可同時讀取；不保證多人同時編輯的交易隔離。
- BroadcastChannel 即時同步；不支援時使用 storage event。同一分頁透過外部 store 訂閱更新。
- localStorage 保存目前訂單、階段、行銷素材與絕對截止時間。刷新可恢復；倒數到期時以當前狀態判定，不會被前一筆訂單的計時器覆蓋。
- 行銷圖片限定 PNG/JPEG/WebP、每張 1 MB 以下，儲存為 data URL；顧客畫面強制灰階。容量不足會在控制台提示，不會宣稱持久化成功。保留至少一張素材。
- 目標為橫向非觸控裝置；手機直向不是本輪驗收範圍。iPad 跨裝置獨立開啟不會接收到電腦的 localStorage / BroadcastChannel；本機版本僅同步同一瀏覽器 origin 的分頁。若需真實跨裝置連線，後續需 WebSocket 服務。
- 並排预覽使用真實目標解析度 iframe 縮放，適合檢視布局；櫃台閱讀距離應以獨立 /display 全螢幕實測。
- 沒有行為追蹤、受測者資料保存、外部字型或外部圖片請求。

## 結構

- src/lib/prototype/types.ts：明確交易與訂單型別。
- src/lib/prototype/model.ts：狀態機、13 情境、商品目錄、統一金額 selector。
- src/lib/prototype/store.ts：持久化、跨分頁同步、截止時間處理。
- src/components/prototype/Control.tsx、LineEditor.tsx：POS 與研究操作。
- src/components/prototype/Display.tsx、Marketing.tsx：不可觸控顧客端與輪播。
- src/components/prototype/Preview.tsx：裝置畫布並排預覽。
- tests/model.test.mjs：計價、轉場及倒數邊界。
- tests/browser/prototype.spec.ts：實際操作、同步、fallback、情境、視窗尺寸。

## 驗證

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

E2E 使用已安裝的 Microsoft Edge 無頭模式，會自行啟動本機開發伺服器；也可重用 port 3000 的服務。無 Edge 的環境請調整 playwright.config.ts 的 channel 並安裝 Playwright Chromium。
測試報告：playwright-report/index.html；各指定尺寸截圖：test-results/viewport-*.png。

## 本次驗收結果（2026-09-22）

- lint、typecheck、production build：通過。
- 模型測試 7 項：通過。
- 瀏覽器流程測試 6 組：通過，涵蓋 13 個情境、跨分頁即時同步、storage fallback、刷新恢復、會員與發票互斥、混合支付／找零、取消收款、倒數與新單中斷、上傳素材保存／移除、商品編輯與刪除。
- 1366×768、1920×1080、1194×834：已用 Edge viewport 驗證與截圖檢視。長訂單最後一項完整可見，摘要未超出畫面，完成卡片完整可見。
- 正式模式的套餐備註、折扣、招待及並排預覽再驗證通過。
- 實體 iPad Safari、櫃台觀看距離及真實第二螢幕硬體尚需研究現場確認；這次不是硬體測試。
- 執行環境的 Windows Codex 沙箱遇到登入錯誤 1385，建置與測試改由使用者授權的沙箱外命令完成；原型本身不依賴這個沙箱。

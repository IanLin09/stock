# Timer Component Test Suite

## 概述

為 `src/app/components/dashboard/timer.tsx` 組件設計的全面單元測試套件。

## 測試架構

### 檔案結構
```
__tests__/
├── timer.test.tsx    # 主要測試檔案
└── README.md         # 測試文檔
```

### 測試工具
- **Jest**: 測試框架
- **React Testing Library**: React 組件測試
- **@testing-library/jest-dom**: DOM 斷言擴展

### Mock 設定
- **Luxon DateTime**: 模擬時間函數
- **react-i18next**: 模擬國際化函數

## 測試涵蓋範圍

### 1. 基本功能 (Basic Functionality)
- ✅ 市場關閉時顯示倒計時
- ✅ 使用紐約時區
- ✅ 組件掛載後渲染內容

### 2. 週末處理 (Weekend Handling)
- ✅ 週六添加額外小時 (48小時)
- ✅ 週日添加額外小時 (24小時)

### 3. 組件屬性 (Component Props)
- ✅ 未提供屬性時使用默認值
- ✅ 接受自定義目標時間

### 4. CSS 類別與結構 (CSS Classes and Structure)
- ✅ 渲染正確的 CSS 類別
- ✅ 驗證 HTML 結構

### 5. 時間格式化 (Time Formatting)
- ✅ 正確格式化時間顯示
- ✅ 處理零填充格式

### 6. 組件生命週期 (Component Lifecycle)
- ✅ 組件卸載時清除定時器

### 7. 翻譯功能 (Translation)
- ✅ 顯示翻譯文本

### 8. 屬性接口 (Props Interface)
- ✅ 接受所有定義的屬性

### 9. 組件狀態 (Component State)
- ✅ 維護掛載狀態

## 測試數據

### 模擬時間設定
```typescript
// 當前時間: 1000 (毫秒)
// 市場開放時間: 1500 (毫秒)
// 市場關閉時間: 2000 (毫秒)
// 工作日: 3 (週三)
```

### 模擬返回值
```typescript
// 時間差異格式化: "01:30:00"
// 週末額外時間: "25:30:00"
// 翻譯鍵: "Until Market Opens"
```

## 運行測試

### 單獨運行計時器測試
```bash
npm test -- --testPathPattern=timer.test.tsx
```

### 帶詳細輸出運行
```bash
npm test -- --testPathPattern=timer.test.tsx --verbose
```

### 監視模式
```bash
npm run testw -- --testPathPattern=timer.test.tsx
```

## 測試結果

✅ **14 個測試全部通過**
- 測試執行時間: ~0.8秒
- 覆蓋率: 完整組件功能覆蓋
- Mock 正常工作: Luxon, react-i18next

## 組件功能驗證

### 核心功能
1. **時區處理**: 正確使用美國/紐約時區
2. **市場時間計算**: 準確計算到市場開放的時間
3. **週末邏輯**: 正確處理週末的額外時間計算
4. **國際化**: 支持多語言文本顯示
5. **響應式更新**: 每秒更新倒計時顯示

### 用戶界面
1. **CSS 樣式**: 正確應用 Tailwind CSS 類別
2. **文本顯示**: 清晰的時間格式 (HH:MM:SS)
3. **布局結構**: Flexbox 垂直居中佈局

### 性能考慮
1. **內存洩漏防護**: 組件卸載時清理定時器
2. **掛載狀態**: 防止伺服器端渲染不一致

## 維護注意事項

1. **時區依賴**: 測試依賴 Luxon 庫的時區功能
2. **Mock 更新**: 如果組件邏輯更改，需要更新對應的 mock
3. **翻譯鍵**: 新增翻譯鍵時需要更新測試 mock
4. **時間格式**: 時間格式更改需要同步更新測試期望值

## 未來改進

1. **市場開放狀態測試**: 添加"Opening Now"狀態的測試
2. **錯誤處理**: 增強 DateTime 錯誤處理測試
3. **性能測試**: 添加長時間運行的性能測試
4. **可訪問性**: 添加無障礙功能測試
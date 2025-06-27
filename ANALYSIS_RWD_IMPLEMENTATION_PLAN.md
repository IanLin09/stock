# Analysis Components RWD Implementation Plan

## 概況分析

### 現有架構
1. **主要頁面**: `analysis/page.tsx` - 固定比例布局 (4:1)
2. **圖表群組**: `chart.tsx` - 垂直堆疊布局 (2:1)
3. **側邊欄**: `list.tsx` - 固定布局
4. **圖表組件**: 
   - `candlestckChart.tsx` - 蠟燭圖 + 移動平均線
   - `volumnChart.tsx` - 成交量圖
   - `macdChart.tsx` - MACD 指標圖
   - `rsiChart.tsx` - RSI 指標圖

### 主要問題
- **固定比例布局**: 在小螢幕上內容擠壓
- **圖表尺寸**: 未針對不同螢幕調整
- **無響應式設計**: 手機端體驗不佳
- **工具列**: 在小螢幕上可能過於複雜
- **文字大小**: 未根據螢幕調整

## 實施計畫

### Phase 1: 建立響應式基礎設施 (高優先級)

#### 1.1 建立響應式 Hooks 和工具
```typescript
// 新增到 hooks/use-analysis-responsive.ts
- useAnalysisLayout() // 判斷使用哪種布局
- useChartDimensions() // 計算圖表尺寸
- useAnalysisBreakpoints() // 分析頁專用斷點
```

#### 1.2 響應式樣式工具
```typescript
// 新增到 utils/analysis-responsive.ts
- getAnalysisLayoutClasses() // 獲取布局類別
- getChartContainerClasses() // 圖表容器樣式
- getAnalysisTextSize() // 文字大小
```

### Phase 2: 主頁面布局改造 (高優先級)

#### 2.1 修改 `analysis/page.tsx`
**目標**: 實現響應式布局切換

**桌面端 (≥1024px)**:
```jsx
<div className="h-full flex flex-row">
  <div className="basis-4/5"> {/* 圖表區域 */}
  <div className="basis-1/5"> {/* 側邊欄 */}
</div>
```

**平板端 (768px-1023px)**:
```jsx
<div className="h-full flex flex-col">
  <div className="h-2/3"> {/* 圖表區域 */}
  <div className="h-1/3"> {/* 側邊欄，水平滾動 */}
</div>
```

**手機端 (<768px)**:
```jsx
<div className="flex flex-col">
  <div className="mb-4"> {/* 簡化圖表 */}
  <div> {/* 標籤頁式側邊欄 */}
</div>
```

### Phase 3: 圖表群組優化 (高優先級)

#### 3.1 修改 `chart.tsx`
**響應式布局**:
- **桌面**: 垂直堆疊 (蠟燭圖 2/3, 指標圖 1/3)
- **平板**: 調整比例 (蠟燭圖 3/5, 指標圖 2/5)
- **手機**: 標籤頁切換顯示

**實施細節**:
```jsx
// 桌面端
{isDesktop && (
  <div className="flex flex-col h-full">
    <div className="basis-2/3">{/* 主圖表 */}</div>
    <div className="basis-1/3">{/* 指標圖表 */}</div>
  </div>
)}

// 手機端
{isMobile && (
  <Tabs defaultValue="main">
    <TabsTrigger value="main">主圖</TabsTrigger>
    <TabsTrigger value="indicators">指標</TabsTrigger>
  </Tabs>
)}
```

### Phase 4: 個別圖表組件優化 (中優先級)

#### 4.1 `candlestckChart.tsx` 優化
**響應式功能**:
- 圖表高度: 桌面 400px → 平板 300px → 手機 250px
- 工具列: 桌面顯示 → 手機隱藏
- 線條寬度: 根據螢幕調整
- Tooltip: 簡化手機版顯示

```jsx
const chartOptions = {
  chart: {
    height: isMobile ? 250 : isTablet ? 300 : 400,
    toolbar: { show: !isMobile },
  },
  stroke: {
    width: isMobile ? [1, 1, 1] : isTablet ? [1, 1.5, 1.5] : [1, 2, 2]
  }
}
```

#### 4.2 `volumnChart.tsx` 優化
**響應式調整**:
- 高度: 桌面 5% → 手機 40px 固定
- 簡化顯示: 手機端移除部分細節

#### 4.3 `macdChart.tsx` & `rsiChart.tsx` 優化
**共同改進**:
- 固定高度 200px → 響應式高度
- 圖表標題: 桌面顯示 → 手機隱藏
- 座標軸標籤: 根據螢幕調整大小

### Phase 5: 側邊欄改造 (中優先級)

#### 5.1 修改 `list.tsx`
**響應式布局**:
- **桌面**: 垂直布局，完整資訊
- **平板**: 水平滾動卡片
- **手機**: 摺疊式資訊或標籤頁

**實施**:
```jsx
// 手機端使用摺疊面板
{isMobile && (
  <Accordion>
    <AccordionItem value="price">價格資訊</AccordionItem>
    <AccordionItem value="indicators">技術指標</AccordionItem>
    <AccordionItem value="reports">報告日期</AccordionItem>
  </Accordion>
)}
```

### Phase 6: 效能優化 (低優先級)

#### 6.1 圖表載入優化
- 手機端延遲載入複雜圖表
- 實施圖表骨架屏
- 條件式載入圖表工具列

#### 6.2 資料優化
- 手機端減少資料點數量
- 實施資料分頁載入

## 實施時程

### Week 1: 基礎設施
- [ ] 建立響應式 hooks
- [ ] 建立樣式工具函數
- [ ] 測試基礎功能

### Week 2: 主要布局
- [ ] 改造 analysis/page.tsx
- [ ] 改造 chart.tsx
- [ ] 基本響應式測試

### Week 3: 圖表優化
- [ ] 優化 candlestckChart.tsx
- [ ] 優化 volumnChart.tsx
- [ ] 優化指標圖表

### Week 4: 側邊欄與測試
- [ ] 改造 list.tsx
- [ ] 全面測試各裝置
- [ ] 效能優化

## 技術細節

### 斷點設計
```scss
// 分析頁專用斷點
sm: 640px   // 手機橫向
md: 768px   // 平板直向  
lg: 1024px  // 平板橫向/小筆電
xl: 1280px  // 桌面
2xl: 1536px // 大螢幕
```

### 圖表尺寸策略
```typescript
const getChartHeight = (screenSize: string, chartType: string) => {
  const heights = {
    candlestick: { xs: 250, sm: 300, md: 350, lg: 400 },
    indicator: { xs: 150, sm: 180, md: 200, lg: 220 },
    volume: { xs: 40, sm: 50, md: 60, lg: 80 }
  }
  return heights[chartType][screenSize] || heights[chartType]['md']
}
```

### 效能考量
- 使用 `dynamic import` 載入圖表
- 實施 `React.memo` 避免不必要重渲染
- 條件式載入複雜功能

## 測試計畫

### 裝置測試
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1920px)

### 功能測試
- [ ] 圖表交互功能
- [ ] 資料載入效能
- [ ] 布局切換流暢度
- [ ] 觸控操作體驗

## 成功指標

1. **使用體驗**: 各裝置上操作流暢
2. **載入效能**: 手機端載入時間 <3 秒
3. **視覺效果**: 圖表在各尺寸下清晰可讀
4. **功能完整**: 所有圖表功能在各裝置正常運作
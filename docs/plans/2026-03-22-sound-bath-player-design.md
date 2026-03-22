# Sound Bath Player 設計文件

## 概述

全站頌缽聲浴播放器，參考 bowlfunction.com，讓用戶在瀏覽時可以播放頌缽音色，營造沉浸式療癒體驗。

## 功能需求

### 核心功能
- 7 脈輪頻率頌缽音色
- 層疊密度控制（1-7 個同時播放）
- 隨機度控制（延遲加入的時間範圍）
- 播放/停止
- 主音量控制

### 脈輪頻率對照

| 脈輪 | 頻率 | 顏色 | 英文名 |
|------|------|------|--------|
| 海底輪 | 396 Hz | 紅 | Root |
| 臍輪 | 417 Hz | 橙 | Sacral |
| 太陽輪 | 528 Hz | 黃 | Solar Plexus |
| 心輪 | 639 Hz | 綠 | Heart |
| 喉輪 | 741 Hz | 藍 | Throat |
| 眉心輪 | 852 Hz | 靛 | Third Eye |
| 頂輪 | 963 Hz | 紫 | Crown |

## UI 設計

### 位置
- 全站顯示（所有頁面）
- 懸浮圓形按鈕，固定於右下角
- 點擊展開控制面板

### 結構
```
收起狀態：60px 圓形按鈕，右下角固定
展開狀態：280x320px 控制面板
```

### 控制面板內容
1. 標題「聲浴」
2. 播放/停止按鈕
3. 層疊密度 slider (1-7)
4. 隨機度 slider (0-100%)
5. 主音量 slider (0-100%)
6. 脈輪選擇器（可選擇啟用哪些脈輪）

## 技術架構

### 方案：純前端 Web Audio API

**音檔來源**：真實頌缽錄音 (CC0 授權)
**存放位置**：`/public/sounds/`

### 檔案結構

```
public/
  sounds/
    root-396.mp3
    sacral-417.mp3
    solar-528.mp3
    heart-639.mp3
    throat-741.mp3
    third-eye-852.mp3
    crown-963.mp3

components/
  sound-bath/
    floating-player.tsx      # 懸浮按鈕 + 展開面板
    chakra-selector.tsx      # 脈輪選擇器
    sound-bath-context.tsx   # React Context

hooks/
  use-sound-bath.ts          # 播放控制
  use-audio-buffer.ts        # 載入 MP3
```

### 狀態管理

```typescript
interface SoundBathState {
  isPlaying: boolean;
  density: number;           // 1-7
  randomness: number;        // 0-100
  selectedChakras: string[]; // 選中的脈輪 ID
  masterVolume: number;      // 0-100
}
```

存在 `localStorage`，key: `sound-bath-state`

### 播放邏輯

**開始播放：**
1. 根據密度隨機選擇 N 個脈輪
2. 每個脈輪根據隨機度參數延遲 0-5 秒加入
3. 淡入 2 秒開始播放
4. 循環播放

**停止播放：**
1. 所有音軌淡出 3 秒
2. 漸進停止

## 音檔規格

- 格式：MP3
- 每個檔案：300-500 KB
- 總大小：約 2-4 MB
- 需 CC0 或可商用授權

## 待辦事項

- [ ] 尋找 7 個 CC0 頌缽錄音
- [ ] 實作 Web Audio 播放邏輯
- [ ] 實作 UI 組件
- [ ] 加入 layout.tsx
- [ ] 測試跨瀏覽器兼容性

## 參考

- https://bowlfunction.com/ - 隨機療愈功能

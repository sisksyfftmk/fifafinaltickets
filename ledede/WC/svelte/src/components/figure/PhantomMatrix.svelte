<script>
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';

  let { activeStep = 0 } = $props();
  let currentView = $derived(activeStep === 5 ? 0 : activeStep === 6 ? 1 : 0);

  // --- 1. デモ用データの生成（実際のデータに置き換え可能） ---
  // 5つの時間帯: 08:09, 09:11, 10:11, 11:12, 12:13
  const timeLabels = ['08:09', '09:11', '10:11', '11:12', '12:13'];
  
  let rawData = [];
  
  // 安定した在庫（ずっと存在する約400枚）
  for (let i = 0; i < 400; i++) {
    rawData.push({ id: `stable_${i}`, presence: [1, 1, 1, 1, 1], firstSeen: 0, flickerCount: 0, type: 'stable' });
  }
  // Bot在庫 A（09:11に出現し、10:11に消滅する163枚）
  for (let i = 0; i < 163; i++) {
    rawData.push({ id: `botA_${i}`, presence: [0, 1, 0, 0, 0], firstSeen: 1, flickerCount: 2, type: 'bot' });
  }
  // Bot在庫 B（11:12に出現し、12:13に消滅する219枚）
  for (let i = 0; i < 219; i++) {
    rawData.push({ id: `botB_${i}`, presence: [0, 0, 0, 1, 0], firstSeen: 3, flickerCount: 2, type: 'bot' });
  }

  // --- 2. 状態管理（Svelte 5） ---
  // 0: Waterfall（初登場順）, 1: Bot Reveal（点滅回数順）
  let currentView = $state(0);

  // 表示モードに合わせてデータを並び替え（ソート）する
  let sortedTickets = $derived.by(() => {
    let tickets = [...rawData];
    if (currentView === 0) {
      // 視点1: 初登場順（古いものから順に表示）
      return tickets.sort((a, b) => a.firstSeen - b.firstSeen);
    } else {
      // 視点2: Botあぶり出し（点滅回数が多いものを上に、同じならBotを上に）
      return tickets.sort((a, b) => b.flickerCount - a.flickerCount);
    }
  });

</script>

<div class="matrix-section">
  <div class="controls">
    <div class="text-content">
      {#if currentView === 0}
        <h3 in:fade>1. The Natural Flow (Waterfall)</h3>
        <p in:fade>キックオフ前日の朝8時から昼12時までの5時間。チケットは時間とともに徐々に追加されていくように見える。</p>
      {:else}
        <h3 class="alert-text" in:fade>2. The Phantom Inventory</h3>
        <p in:fade>しかし「出入りの激しさ」で並べ替えると真実が浮かび上がる。上部に集まった赤い帯は、わずか1時間で現れては消えた約380枚のBotによる架空の在庫だ。</p>
      {/if}
    </div>
    
    <div class="buttons">
      <button class:active={currentView === 0} onclick={() => currentView = 0}>1. Waterfall表示</button>
      <button class:active={currentView === 1} onclick={() => currentView = 1}>2. Botあぶり出し</button>
    </div>
  </div>

  <div class="matrix-container">
    <div class="time-header">
      {#each timeLabels as time}
        <div class="time-label">{time}</div>
      {/each}
    </div>

    <div class="matrix-body">
      {#each sortedTickets as ticket (ticket.id)}
        <div class="ticket-row" animate:flip={{ duration: 1200 }}>
          {#each ticket.presence as isPresent}
            <div 
              class="cell" 
              class:present={isPresent === 1} 
              class:is-bot={currentView === 1 && ticket.type === 'bot'}
              class:dimmed={currentView === 1 && ticket.type === 'stable'}
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .matrix-section {
    background-color: #080808;
    color: white;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 900px;
    margin: 0 auto;
  }

  .controls {
    margin-bottom: 2rem;
    min-height: 120px;
  }

  .text-content h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #38bdf8;
  }

  .text-content h3.alert-text {
    color: #ef4444;
  }

  .text-content p {
    font-size: 1rem;
    line-height: 1.6;
    color: #cbd5e1;
  }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 1rem;
  }

  button {
    background: #1e293b;
    color: white;
    border: 1px solid #334155;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover { background: #334155; }
  
  button.active {
    background: #38bdf8;
    color: #000;
    border-color: #38bdf8;
    font-weight: bold;
  }

  /* マトリックスのスタイル */
  .matrix-container {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
  }

  .time-header {
    display: flex;
    margin-bottom: 10px;
    padding-left: 10px; /* 余白調整 */
  }

  .time-label {
    flex: 1;
    text-align: center;
    font-size: 0.8rem;
    color: #888;
    font-family: 'Courier New', Courier, monospace;
    border-right: 1px solid #222;
  }
  .time-label:last-child { border-right: none; }

  .matrix-body {
    display: flex;
    flex-direction: column;
    gap: 1px; /* 行と行の隙間 */
  }

  .ticket-row {
    display: flex;
    height: 3px; /* 1行の高さ。データ量に合わせて調整 */
    width: 100%;
  }

  .cell {
    flex: 1;
    background-color: #1a1a1a; /* チケットが存在しない時の色 */
    transition: background-color 0.8s ease;
  }

  /* Waterfallビューでの通常表示（青） */
  .cell.present {
    background-color: #38bdf8;
  }

  /* Botあぶり出しビュー（赤く光らせる） */
  .cell.present.is-bot {
    background-color: #ef4444;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.8);
  }

  /* Botあぶり出しビュー時の一般チケット（暗くして目立たなくする） */
  .cell.present.dimmed {
    background-color: #334155;
  }
</style>
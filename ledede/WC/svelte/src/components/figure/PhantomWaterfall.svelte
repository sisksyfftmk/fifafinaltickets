<script>
  // プロップスの受け取り（Svelte 5のRunes記法）。
  // 親から値が来ない場合は 'all'（全表示）をデフォルトにして、真っ白になるのを防ぎます。
  let { phase = 'all' } = $props();

  const svgWidth = 800;
  const svgHeight = 400;
  const maxY = 700;

  // 全26回分のスクレイピングデータ
  const rawData = [
    { time: "00:53", count: 450 }, { time: "01:03", count: 473 }, { time: "02:04", count: 469 },
    { time: "05:07", count: 448 }, { time: "06:08", count: 471 }, { time: "07:09", count: 476 },
    // ⬇️ 魔の5時間（isFocus: true）
    { time: "08:09", count: 462, isFocus: true, wfIndex: 0, diff: 0, base: 0, type: 'base' },
    { time: "09:11", count: 625, isFocus: true, wfIndex: 1, diff: 163, base: 462, type: 'add' },
    { time: "10:11", count: 412, isFocus: true, wfIndex: 2, diff: -213, base: 625, type: 'sub' },
    { time: "11:12", count: 631, isFocus: true, wfIndex: 3, diff: 219, base: 412, type: 'add' },
    { time: "12:13", count: 420, isFocus: true, wfIndex: 4, diff: -211, base: 631, type: 'sub' },
    // ⬆️
    { time: "13:14", count: 485 }, { time: "18:43", count: 446 }, { time: "19:44", count: 467 },
    { time: "20:45", count: 447 }, { time: "21:46", count: 466 }, { time: "22:47", count: 426 },
    { time: "23:48", count: 458 }, { time: "00:49", count: 456 }, { time: "01:50", count: 462 },
    { time: "04:53", count: 461 }, { time: "05:54", count: 457 }, { time: "06:55", count: 447 },
    { time: "07:56", count: 451 }, { time: "10:01", count: 394 }, { time: "12:02", count: 215 }
  ];

  // phaseの文字列から状態を計算（Svelte 5の $derived を使用）
  let mode = $derived(
    phase === 'all' ? 0 : 
    phase === 'focus' ? 1 : 
    (phase && phase.startsWith('step')) ? 2 : 0
  );
  
  let revealedWfIndex = $derived(
    (phase && phase.startsWith('step')) ? parseInt(phase.replace('step', '')) - 1 : -1
  );

  // Y軸スケール計算関数
  const scaleY = (val) => svgHeight - (val / maxY) * svgHeight;
  const scaleH = (val) => (Math.abs(val) / maxY) * svgHeight;

  // グラフの棒（Rect）の座標・色を一括計算
  let bars = $derived(rawData.map((d, i) => {
    let x, y, w, h, opacity, fill;

    const allWidth = (svgWidth / rawData.length) * 0.7;
    const allX = i * (svgWidth / rawData.length) + (svgWidth / rawData.length) * 0.15;
    const allY = scaleY(d.count);
    const allH = scaleH(d.count);

    const wfWidth = (svgWidth / 5) * 0.5;
    const wfX = d.isFocus ? (d.wfIndex * (svgWidth / 5) + (svgWidth / 5) * 0.25) : allX;
    let wfY = allY;
    let wfH = allH;

    if (d.isFocus && mode === 2) {
      if (d.type === 'base') { wfY = scaleY(d.count); wfH = scaleH(d.count); }
      else if (d.type === 'add') { wfY = scaleY(d.count); wfH = scaleH(d.diff); }
      else if (d.type === 'sub') { wfY = scaleY(d.base); wfH = scaleH(d.diff); }
    }

    x = (mode === 2 && d.isFocus) ? wfX : allX;
    y = (mode === 2 && d.isFocus) ? wfY : allY;
    w = (mode === 2 && d.isFocus) ? wfWidth : allWidth;
    h = (mode === 2 && d.isFocus) ? wfH : allH;

    // 透過度と色の制御
    if (mode === 0) {
      opacity = 1; fill = "#38bdf8"; 
    } else if (mode === 1) {
      opacity = d.isFocus ? 1 : 0.15; 
      fill = d.isFocus ? "#38bdf8" : "#334155";
    } else if (mode === 2) {
      if (!d.isFocus) {
        opacity = 0; fill = "#334155";
      } else {
        if (d.wfIndex <= revealedWfIndex) {
          opacity = 1;
          if (d.type === 'add') fill = "#ef4444"; 
          else if (d.type === 'sub') fill = "#0ea5e9"; 
          else fill = "#64748b"; 
        } else {
          opacity = 0.05; 
          fill = "#334155";
        }
      }
    } else {
      opacity = 1; fill = "#38bdf8"; // フェールセーフ（絶対に消えないようにする）
    }
    
    return { ...d, x, y, w, h, opacity, fill };
  }));
</script>

<div class="waterfall-container">
  <svg viewBox="0 0 {svgWidth} {svgHeight + 50}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    
    {#if mode >= 0}
      <line x1="0" y1={scaleY(200)} x2={svgWidth} y2={scaleY(200)} class="grid-line" />
      <line x1="0" y1={scaleY(400)} x2={svgWidth} y2={scaleY(400)} class="grid-line" />
      <line x1="0" y1={scaleY(600)} x2={svgWidth} y2={scaleY(600)} class="grid-line" />
    {/if}

    {#if mode === 2}
      {#each bars as bar, i}
        {#if bar.isFocus && bar.wfIndex > 0 && bar.wfIndex <= revealedWfIndex}
          {@const prevBar = bars[i - 1]}
          {#if prevBar}
            <line
              x1={prevBar.x + prevBar.w}
              y1={bar.type === 'add' ? bar.y + bar.h : bar.y}
              x2={bar.x}
              y2={bar.type === 'add' ? bar.y + bar.h : bar.y}
              class="connecting-line fade-in"
            />
          {/if}
        {/if}
      {/each}
    {/if}

    {#each bars as bar}
      <rect
        x={bar.x} y={bar.y} width={bar.w} height={bar.h}
        fill={bar.fill} opacity={bar.opacity} rx="4"
      />
      {#if mode === 2 && bar.isFocus && bar.wfIndex <= revealedWfIndex}
        <text x={bar.x + bar.w/2} y={svgHeight + 30} class="axis-label fade-in">{bar.time}</text>
        <text
          x={bar.x + bar.w / 2}
          y={bar.type === 'sub' ? bar.y + bar.h + 20 : bar.y - 10}
          fill={bar.fill}
          class="diff-label fade-in"
        >
          {bar.diff > 0 ? `+${bar.diff}` : bar.diff < 0 ? bar.diff : bar.count}
        </text>
      {/if}
    {/each}
  </svg>
</div>

<style>
  .waterfall-container {
    width: 100%; 
    height: 100%;
    min-height: 250px; /* ★絶対に潰れないように最小高さを設定 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  rect {
    transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .grid-line { stroke: #334155; stroke-dasharray: 4; stroke-width: 1; opacity: 0.5; }
  .connecting-line { stroke: #94a3b8; stroke-dasharray: 4; stroke-width: 2; }
  .axis-label { fill: #cbd5e1; font-size: 14px; text-anchor: middle; font-family: sans-serif; }
  .diff-label { font-size: 20px; font-weight: bold; text-anchor: middle; }
  
  .fade-in { animation: fadeIn 0.8s ease forwards; }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
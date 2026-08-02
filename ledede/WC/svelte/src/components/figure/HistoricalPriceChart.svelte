<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  const data = [
    { Year: 1994, Price: 475 },
    { Year: 1998, Price: 390 },
    { Year: 2002, Price: 660 },
    { Year: 2006, Price: 749 },
    { Year: 2010, Price: 900 },
    { Year: 2014, Price: 990 },
    { Year: 2018, Price: 1100 },
    { Year: 2022, Price: 1606 },
    { Year: 2026, Price: 8680 } 
  ];

  const width = 800;
  const height = 450;
  // 🌟 1. 上の余白を少し広げて、棒グラフの数字が切れないように調整
  const margin = { top: 80, right: 40, bottom: 50, left: 80 };

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const yScale = d3.scaleLinear()
    .domain([0, 10000])
    .range([height - margin.bottom, margin.top]);

  const yTicks = yScale.ticks(5);

  let chartVisible = $state(false);
  let chartContainer;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          chartVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (chartContainer) {
      observer.observe(chartContainer);
    }

    return () => observer.disconnect();
  });
</script>

<div class="historical-chart-container" bind:this={chartContainer}>
  <h2>World Cup Final Ticket Price Face Value (1994 - 2026)</h2>
  
  <svg viewBox="0 0 {width} {height}">
    
    <g class="axis y-axis">
      {#each yTicks as tick}
        <g class="tick" transform="translate(0, {yScale(tick)})">
          <line x1={margin.left} x2={width - margin.right} stroke="#333" stroke-dasharray="2 2" />
          <text x={margin.left - 10} y="5" text-anchor="end" class="tick-label">${tick.toLocaleString()}</text>
        </g>
      {/each}
    </g>

    <g class="axis x-axis" transform="translate(0, {height - margin.bottom})">
      <line x1={margin.left} x2={width - margin.right} stroke="#333" />
      {#each data as d}
        <text 
          x={xScale(d.Year) + xScale.bandwidth() / 2} 
          y="25" 
          text-anchor="middle" 
          class="tick-label"
          class:highlight-year={d.Year === 2026}
        >
          {d.Year}
        </text>
      {/each}
    </g>

    {#each data as d, i}
      <g class="bar-group">
        {#if d.Year !== 2026}
          <rect
            x={xScale(d.Year)}
            y={yScale(d.Price)}
            width={xScale.bandwidth()}
            height={height - margin.bottom - yScale(d.Price)}
            fill="#334155"
            class="normal-bar"
          />
          <text
            x={xScale(d.Year) + xScale.bandwidth() / 2}
            y={yScale(d.Price) - 10}
            text-anchor="middle"
            class="bar-value normal"
          >
            ${d.Price.toLocaleString()}
          </text>
        
        {:else}
          <rect
            x={xScale(d.Year)}
            y={chartVisible ? yScale(d.Price) : height - margin.bottom}
            width={xScale.bandwidth()}
            height={chartVisible ? height - margin.bottom - yScale(d.Price) : 0}
            fill="#ef4444"
            class="shock-bar"
          />
          <g class="shock-label-group" class:visible={chartVisible}>
            <text
              x={xScale(d.Year) + xScale.bandwidth() / 2}
              y={yScale(d.Price) - 25}
              text-anchor="middle"
              class="bar-value shock"
            >
              ${d.Price.toLocaleString()}
            </text>
            <text
              x={xScale(d.Year) + xScale.bandwidth() / 2}
              y={yScale(d.Price) - 50}
              text-anchor="middle"
              class="bar-label shock"
            >
              2026 FINAL
            </text>
          </g>
        {/if}
      </g>
    {/each}
  </svg>

  <p class="source-text">
    Source: <a href="https://theworldcupguide.com/how-much-are-world-cup-tickets-since-1994/" target="_blank" rel="noopener noreferrer">The World Cup Guide</a>
  </p>
</div>

<style>
  .historical-chart-container {
    pointer-events: auto;
    max-width: 800px;
    margin: 0 auto;
    padding: 3rem 2.5rem;
    background: rgba(8, 12, 16, 0.95);
    border: 1px solid #333;
    border-left: 4px solid #ef4444; 
    border-radius: 4px;
    color: white;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(5px);
    font-family: 'Courier New', Courier, monospace; 
  }

  .historical-chart-container h2 {
    margin: 0;
    font-size: 2.2rem; /* 🌟 タイトルを少し大きく */
    font-family: sans-serif;
    letter-spacing: 1px;
    color: rgb(52,144,220); /* 🌟 アクセントカラーの黄色に */
    font-weight: 900;
  }

  .subtitle {
    margin: 5px 0 0px 0; /* 下の余白を詰める */
    font-size: 1rem; /* 🌟 少し大きく */
    color: #cbd5e1; /* 🌟 少し明るいグレーに */
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .historical-chart-container svg {
    width: 100%;
    height: auto;
    overflow: visible; 
    margin-top: 3rem; /* 🌟 1. テキストとグラフの間を大きく開ける */
  }

  /* 🌟 3. 軸ラベルの文字を大きく（12px -> 16px） */
  .tick-label {
    fill: #94a3b8;
    font-size: 16px;
    letter-spacing: 1px;
    font-family: sans-serif;
  }
  .highlight-year {
    fill: #ef4444;
    font-weight: bold;
    font-size: 18px; /* 🌟 2026年のラベルをさらに大きく */
  }

  /* 🌟 3. 棒グラフ上の金額テキストを大きく（11px -> 14px） */
  .bar-value {
    font-size: 14px;
    letter-spacing: 0.5px;
    font-family: sans-serif;
  }
  .bar-value.normal {
    fill: #cbd5e1;
  }
  .bar-value.shock {
    fill: #ef4444;
    font-size: 22px; /* 🌟 2026年の金額をさらに大きく */
    font-weight: bold;
    text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
  }
  .bar-label.shock {
    fill: #f8fafc;
    font-size: 14px; /* 🌟 2026 FINALの文字を大きく */
    font-weight: bold;
    letter-spacing: 1px;
  }

  .normal-bar {
    opacity: 0.8;
  }

  .shock-bar {
    transition: y 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s, 
                height 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s;
  }

  .shock-label-group {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.5s ease 1.7s, transform 0.5s ease 1.7s;
  }
  .shock-label-group.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* 🌟 4. 出典のスタイルを追加 */
  .source-text {
    margin-top: 2rem;
    font-size: 0.9rem;
    color: #cbd5e1; /* 👈 暗いグレーから視認性の高い明るいグレーに変更 */
    text-align: right;
    font-family: sans-serif;
  }

  /* 🌟 リンク（The World Cup Guide）部分の色と強調 */
  .source-text a {
    color: #38bdf8; /* 👈 明るい水色 */
    font-weight: bold; /* 👈 文字を太字にしてくっきり見せる */
    text-decoration: underline; /* 👈 リンクと分かりやすいように下線を追加 */
    transition: color 0.2s ease;
  }

  /* マウスを乗せた時の色 */
  .source-text a:hover {
    color: #7dd3fc;
  }
</style>
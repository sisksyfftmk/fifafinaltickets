<script>
  import * as d3 from 'd3';

  // 価格帯のデータセット
  const data = [
    { band: "$70k+", ids: 0, tickets: 0 },
    { band: "$60k–70k", ids: 1, tickets: 1 },
    { band: "$50k–60k", ids: 3, tickets: 21 },
    { band: "$40k–50k", ids: 4, tickets: 9 },
    { band: "$30k–40k", ids: 27, tickets: 87 },
    { band: "$20k–30k", ids: 62, tickets: 164 },
    { band: "$10k–20k", ids: 654, tickets: 1615 },
    { band: "Under $10k", ids: 271, tickets: 592 }
  ];

  let width = $state(600);
  let height = $state(400);

  const margin = { top: 60, right: 80, bottom: 40, left: 110 };

  let innerWidth = $derived(width - margin.left - margin.right);
  let innerHeight = $derived(height - margin.top - margin.bottom);

  // Y軸（価格帯）のスケール設定
  let yScale = $derived(
    d3.scaleBand()
      .domain(data.map(d => d.band))
      .range([0, innerHeight])
      .padding(0.3)
  );

  // X軸（数量）のスケール設定（チケット数の最大値に合わせる）
  let xScale = $derived(
    d3.scaleLinear()
      .domain([0, d3.max(data, d => d.tickets)])
      .range([0, innerWidth])
  );
</script>

<div class="chart-container" bind:clientWidth={width} bind:clientHeight={height}>
  
  <div class="legend">
    <div class="legend-item"><span class="legend-color id-bg"></span>Listings (IDs)</div>
    <div class="legend-item"><span class="legend-color ticket-bg"></span>availableTickets</div>
  </div>

  <svg {width} {height}>
    <g transform={`translate(${margin.left},${margin.top})`}>
      
      {#each xScale.ticks(5) as tick}
        <line 
          x1={xScale(tick)} x2={xScale(tick)} 
          y1={0} y2={innerHeight} 
          stroke="rgba(255,255,255,0.1)" stroke-dasharray="4"
        />
        <text 
          x={xScale(tick)} y={innerHeight + 25} 
          fill="#888" font-size="14" text-anchor="middle"
        >
          {tick}
        </text>
      {/each}

      {#each data as d}
        <rect
          x={0}
          y={yScale(d.band)}
          width={xScale(d.tickets)}
          height={yScale.bandwidth()}
          fill="rgb(52,144,220)"
          opacity="0.25"
          rx="4"
        />
        <text 
          x={xScale(d.tickets) + 8} 
          y={yScale(d.band) + yScale.bandwidth() * 0.35} 
          fill="rgb(52,144,220)" font-size="14" font-weight="bold" alignment-baseline="middle" opacity="0.9"
        >
          {d.tickets}
        </text>
        
        <rect
          x={0}
          y={yScale(d.band) + yScale.bandwidth() * 0.25}
          width={xScale(d.ids)}
          height={yScale.bandwidth() * 0.5}
          fill="rgb(198,12,48)"
          rx="2"
        />
        <text 
          x={xScale(d.ids) + 8} 
          y={yScale(d.band) + yScale.bandwidth() * 0.75} 
          fill="rgb(198,12,48)" font-size="14" font-weight="bold" alignment-baseline="middle"
        >
          {d.ids}
        </text>

        <text 
          x={-15} 
          y={yScale(d.band) + yScale.bandwidth() / 2} 
          fill="#ccc" font-size="15" font-weight="bold" font-family="monospace" text-anchor="end" alignment-baseline="middle"
        >
          {d.band}
        </text>
      {/each}
    </g>
  </svg>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    min-height: 450px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .legend {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 20px; /* 🌟 隙間を広げて見やすく調整 */
    background: rgba(0,0,0,0.5);
    padding: 10px 16px;
    border-radius: 6px;
    border: 1px solid #333;
  }
  /* 🌟 Legendの文字サイズとアイコンを大きく調整 */
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: bold; color: #eee; }
  .legend-color { width: 16px; height: 16px; border-radius: 3px; }
  .ticket-bg { background: rgba(56, 189, 248, 0.4); border: 1px solid rgb(52,144,220); }
  .id-bg { background: rgb(198,12,48); }
</style>
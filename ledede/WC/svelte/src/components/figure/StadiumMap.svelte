<script>
  import { stadiumPaths } from '../../data/stadium_paths.js';

  let { 
    highlightIds = [], 
    surgeSections = [], 
    vanishSections = [], 
    sectionChanges = {}, 
    ticketData = [],
    ticketCounts = [] // ヒートマップ用データ（空の場合は通常モード）
  } = $props();

  const processedPaths = stadiumPaths.map(path => {
    const match = path.id ? path.id.match(/\d+/) : null;
    return {
      ...path,
      secNum: match ? match[0] : null
    };
  });

  let activeSectionsFromIds = $derived.by(() => {
    if (!highlightIds || highlightIds.length === 0 || !ticketData) return [];
    const ticketMap = new Map();
    for (const t of ticketData) {
      ticketMap.set(String(t.id), String(t.section).trim());
    }
    return highlightIds.map(hId => ticketMap.get(String(hId))).filter(Boolean);
  });

  let surgedSet = $derived(new Set([...activeSectionsFromIds, ...(surgeSections || [])].map(String)));
  let vanishedSet = $derived(new Set((vanishSections || []).map(String)));
  let hasActiveFilters = $derived(surgedSet.size > 0 || vanishedSet.size > 0);

  let countsMap = $derived.by(() => {
    const map = new Map();
    if (!ticketCounts || ticketCounts.length === 0) return map; 
    
    for (const item of ticketCounts) {
      const match = String(item.section).match(/\d+/);
      const secNum = match ? match[0] : String(item.section);
      const current = map.get(secNum) || 0;
      map.set(secNum, current + (item.unique_tickets || 0));
    }
    return map;
  });

  let maxTickets = $derived(
    countsMap.size > 0 ? Math.max(...Array.from(countsMap.values())) : 1
  );

  let isHeatmapMode = $derived(countsMap.size > 0);

  function getFillColor(secNum) {
    if (isHeatmapMode) {
      if (!secNum || !countsMap.has(secNum)) return '#1e293b'; 
      const count = countsMap.get(secNum);
      const intensity = count / maxTickets;
      const lightness = 95 - (intensity * 60); 
      return `hsl(350, 85%, ${lightness}%)`;
    } else {
      return null;
    }
  }

  let displayPaths = $derived.by(() => {
    if (!hasActiveFilters) return processedPaths;
    return [...processedPaths].sort((a, b) => {
      const aActive = surgedSet.has(a.secNum) || vanishedSet.has(a.secNum) ? 1 : 0;
      const bActive = surgedSet.has(b.secNum) || vanishedSet.has(b.secNum) ? 1 : 0;
      return aActive - bActive;
    });
  });

  let hoveredSection = $state(null);
</script>

<div class="stadium-map-container">
  
  {#if hoveredSection}
    <div class="fixed-info-panel">
      <div class="panel-sec">SEC {hoveredSection}</div>
      {#if isHeatmapMode}
        <div class="panel-count">
          Tickets: {countsMap.get(hoveredSection) || 0}
        </div>
      {/if}
      {#if sectionChanges[hoveredSection]}
        <div class="panel-diff">
          {sectionChanges[hoveredSection]}
        </div>
      {/if}
    </div>
  {/if}

  <svg viewBox="50 500 4000 3100" preserveAspectRatio="xMidYMid meet">
    <g>
      {#each displayPaths as path (path.id)}
        <path 
          d={path.d} 
          id={path.id}
          class="stadium-seat"
          class:surged={surgedSet.has(path.secNum)}
          class:vanished={vanishedSet.has(path.secNum)}
          class:dimmed={hasActiveFilters && !surgedSet.has(path.secNum) && !vanishedSet.has(path.secNum)}
          style={getFillColor(path.secNum) ? `--seat-fill: ${getFillColor(path.secNum)};` : ""} 
          onmouseover={() => { if (path.secNum) hoveredSection = path.secNum; }}
          onmouseout={() => hoveredSection = null}
        ></path>
      {/each}
    </g>
  </svg>
</div>

<style>
  .stadium-map-container { 
    position: relative; 
    width: 100%; 
    height: 100%; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
  }
  
  svg { width: 100%; height: 100%; display: block; }
  
  .stadium-seat { 
    fill: var(--seat-fill, #64748b); 
    stroke: #0f172a; 
    stroke-width: 8px; 
    transition: fill 0.4s ease, opacity 0.3s ease; 
    cursor: pointer; 
    pointer-events: auto; 
  }
  
  .stadium-seat.dimmed { 
    fill: #1e293b !important;
    opacity: 0.4; 
  }
  
  .stadium-seat.surged { 
    fill: #ef4444 !important; 
    stroke: #ffffff; 
    stroke-width: 25px; 
    opacity: 1; 
    animation: pulse-red 1.5s infinite alternate; 
  }
  .stadium-seat.vanished { 
    fill: #3b82f6 !important; 
    stroke: #ffffff; 
    stroke-width: 25px; 
    opacity: 1; 
    animation: pulse-blue 1.5s infinite alternate; 
  }
  
  @keyframes pulse-red { 
    0% { filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.6)); } 
    100% { filter: drop-shadow(0 0 25px rgba(239, 68, 68, 1)); } 
  }
  @keyframes pulse-blue { 
    0% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.6)); } 
    100% { filter: drop-shadow(0 0 25px rgba(59, 130, 246, 1)); } 
  }

  /* 🌟 ツールチップ全体の余白を広げる */
  .fixed-info-panel {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(10, 10, 10, 0.92);
    border: 1px solid #ffda79;
    padding: 16px 20px; /* 👈 余白を大きく */
    border-radius: 8px;
    pointer-events: none;
    z-index: 50;
    backdrop-filter: blur(4px);
    font-family: 'Courier New', Courier, monospace;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.9);
  }

  /* 🌟 セクション名（SEC XXX）の文字を大きく */
  .panel-sec {
    font-weight: 900;
    color: #ffda79;
    font-size: 1.4rem; /* 👈 1.05rem から 1.4rem へ拡大 */
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 218, 121, 0.3);
    padding-bottom: 4px;
  }

  /* 🌟 チケット枚数の文字を大きく */
  .panel-count {
    color: #ffffff;
    font-size: 1.15rem; /* 👈 0.9rem から 1.15rem へ拡大 */
    font-weight: bold;
    margin-bottom: 6px;
  }

  /* 🌟 増減（Prev → Curr）の文字を大きく */
  .panel-diff {
    color: #ef4444;
    font-size: 1.05rem; /* 👈 0.8rem から 1.05rem へ拡大 */
    white-space: nowrap;
    font-weight: bold;
  }
</style>
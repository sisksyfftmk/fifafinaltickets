<script>
  import * as d3 from 'd3';

  let { 
    data = [], 
    highlightIds = [], 
    currentTime = null,
    emphasizeAll = false 
  } = $props();

  let svgElement;
  let chartInitialized = false;

  const margin = { top: 20, right: 30, bottom: 40, left: 55 };
  const width = 900;
  const height = 500;

  let xScale, yScale, lineGenerator;

  // 🌟 データに「切れ目（null）」を挿入する関数
  function insertGaps(dataArray) {
    if (dataArray.length <= 1) return dataArray;

    // 時間順にソート
    const sorted = [...dataArray].sort((a, b) => a.parsedTime - b.parsedTime);
    const result = [];
    
    // 🌟 閾値を「70分」に設定（70分 * 60秒 * 1000ミリ秒 = 4,200,000ミリ秒）
    const maxGapMs = 70 * 60 * 1000; 

    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);

      if (i < sorted.length - 1) {
        const timeDiff = sorted[i+1].parsedTime - sorted[i].parsedTime;
        
        // 時間が大きく開いていたら、無効なデータ(null)を間に挟む
        if (timeDiff > maxGapMs) {
          result.push({
            id: sorted[i].id,
            parsedTime: new Date(sorted[i].parsedTime.getTime() + timeDiff / 2),
            price_usd: null // 🌟 D3の .defined() がここで線を切る
          });
        }
      }
    }
    return result;
  }

  $effect(() => {
    if (svgElement && data.length > 0 && !chartInitialized) {
      const parsedData = data.map(d => ({
        ...d,
        parsedTime: new Date(d.scraped_time),
        price_usd: +d.price_usd
      }));

      xScale = d3.scaleTime()
        .domain(d3.extent(parsedData, d => d.parsedTime))
        .range([margin.left, width - margin.right]);

      yScale = d3.scaleLinear()
        .domain([0, 70000])
        .range([height - margin.bottom, margin.top]);

      lineGenerator = d3.line()
        // 🌟 ここを追加：データが存在し、かつ数値として有効な場合のみ線を引く
        .defined(d => d && d.price_usd != null && !isNaN(d.price_usd))
        .x(d => xScale(d.parsedTime))
        .y(d => yScale(d.price_usd))
        .curve(d3.curveMonotoneX);

      drawBaseChart();
      chartInitialized = true;
    }
  });

  $effect(() => {
    if (chartInitialized) {
      const parsedData = data.map(d => ({
        ...d,
        parsedTime: new Date(d.scraped_time),
        price_usd: +d.price_usd
      }));
      updateChart(parsedData, highlightIds, currentTime, emphasizeAll);
    }
  });

  function drawBaseChart() {
    const svg = d3.select(svgElement)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");

    svg.selectAll("*").remove();

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%m/%d %H:%M")))
      .attr("class", "axis-text")
      .selectAll("text")
      .style("fill", "#9ca3af")
      .style("font-size", "12px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `$${d / 1000}k`))
      .attr("class", "axis-text")
      .selectAll("text")
      .style("fill", "#9ca3af")
      .style("font-size", "12px");

    svg.selectAll(".domain").style("stroke", "#4b5563");
    svg.selectAll(".tick line").style("stroke", "#374151");

    svg.append("g").attr("id", "bg-lines-layer");
    svg.append("g").attr("id", "highlight-lines-layer");
    svg.append("g").attr("id", "dots-layer");
  }

  function updateChart(currentData, currentHighlightIds, currentCurrentTime, emphasize) {
    const svg = d3.select(svgElement);
    const bgLayer = svg.select("#bg-lines-layer");
    const highlightLayer = svg.select("#highlight-lines-layer");
    const dotsLayer = svg.select("#dots-layer");

    if (!bgLayer.node()) return;

    const targetDate = currentCurrentTime ? new Date(currentCurrentTime) : new Date('2026-07-20');
    
    const visibleData = currentData.filter(d => d.parsedTime <= targetDate);
    const nestedData = d3.group(visibleData, d => d.id);
    
    // 🌟 ここで各グループ（各チケットID）のデータに対して insertGaps() を適用する
    const allGroups = Array.from(nestedData.values()).map(groupArray => insertGaps(groupArray));

    // --- 1. 背景線（または点）の描画 ---
    const bgLines = bgLayer.selectAll(".bg-line")
      .data(allGroups, d => d[0].id);

    bgLines.exit().remove();

    const bgLinesEnter = bgLines.enter()
      .append("path")
      .attr("class", "bg-line")
      .attr("fill", "none");

    const allBgLines = bgLinesEnter.merge(bgLines)
      .attr("d", d => {
        // データが1点しかない場合、または有効なデータが1点しかない場合は、小さな横線を描く
        const validData = d.filter(item => item.price_usd != null);
        if (validData.length === 1) {
          const x = xScale(validData[0].parsedTime);
          const y = yScale(validData[0].price_usd);
          return `M ${x - 3},${y} L ${x + 3},${y}`; // 🌟 幅6pxの少し見やすい横線
        }
        return lineGenerator(d);
      });

    // ハイライト演出 (emphasize)
    if (emphasize) {
      allBgLines
        .transition().duration(400) // パッと光る
        .attr("stroke", "#ffffff")
        .attr("stroke-width", d => {
             const validData = d.filter(item => item.price_usd != null);
             return validData.length === 1 ? 4 : 3;
        }) // 1点の時は少し太く光る
        .attr("opacity", 0.9)
        .transition().duration(1500).delay(800) // ゆっくり元に戻る
        .attr("stroke", "#4b5563") // 🌟 戻った後も少しだけ明るめのグレー
        .attr("stroke-width", d => {
             const validData = d.filter(item => item.price_usd != null);
             return validData.length === 1 ? 3 : 1.2;
        }) // 🌟 1点の時は戻った後も太さを保つ
        .attr("opacity", d => {
             const validData = d.filter(item => item.price_usd != null);
             return validData.length === 1 ? 0.6 : 0.35;
        }); // 🌟 1点の時は不透明度も高めに残す
    } else {
      // 通常時
      allBgLines
        .attr("stroke", "#4b5563")
        .attr("stroke-width", d => {
             const validData = d.filter(item => item.price_usd != null);
             return validData.length === 1 ? 3 : 1.2;
        }) // 🌟 ここでも1点の時は太さを保つ
        .attr("opacity", d => {
             const validData = d.filter(item => item.price_usd != null);
             return validData.length === 1 ? 0.6 : 0.35;
        });
    }

    // --- 2. 前景（注目チケットの太線） ---
    // 前景のハイライトグループも gaps の適用が必要です
    const highlightGroupsRaw = Array.from(nestedData.values()).filter(arr => currentHighlightIds.includes(arr[0].id));
    const highlightGroups = highlightGroupsRaw.map(groupArray => insertGaps(groupArray));

    const hlLines = highlightLayer.selectAll(".hl-line")
      .data(highlightGroups, d => d[0].id);

    hlLines.exit()
      .transition().duration(300)
      .style("opacity", 0)
      .remove();

    const hlLinesEnter = hlLines.enter()
      .append("path")
      .attr("class", "hl-line")
      .attr("fill", "none")
      .attr("stroke-width", 4)
      .style("opacity", 0);

    hlLinesEnter.merge(hlLines)
      .transition().duration(500)
      .style("opacity", 1)
      .attr("stroke", d => "#ef4444")
      .attr("d", d => lineGenerator(d));

    // --- 3. 先端ドット ---
    // nullデータを取り除いてから最後の点を見つける
    const latestPoints = highlightGroups.map(arr => {
      const validPoints = arr.filter(p => p.price_usd != null);
      return validPoints[validPoints.length - 1];
    }).filter(Boolean); // nullになった配列がないか安全のためにフィルター

    const dots = dotsLayer.selectAll(".hl-dot")
      .data(latestPoints, d => d.id);

    dots.exit().remove();

    const dotsEnter = dots.enter()
      .append("circle")
      .attr("class", "hl-dot")
      .attr("r", 6)
      .style("opacity", 0);

    dotsEnter.merge(dots)
      .transition().duration(500)
      .style("opacity", 1)
      .attr("fill", d => "#ef4444")
      .attr("cx", d => xScale(d.parsedTime))
      .attr("cy", d => yScale(d.price_usd));
  }
</script>

<div class="chart-container">
  <svg bind:this={svgElement}></svg>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    background: rgba(17, 24, 39, 0.85);
    border-radius: 0.75rem;
    padding: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border: 1px solid #374151;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
<script>　
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  
  import OpeningClock from "$components/OpeningClock.svelte";
  import PriceChart from "$components/figure/PriceChart.svelte";
  import IntroVisual from "$components/figure/IntroVisual.svelte";
  import HistoricalPriceChart from "$components/figure/HistoricalPriceChart.svelte";
  import StadiumMap from "$components/figure/StadiumMap.svelte";
  import PriceDistributionChart from "$components/figure/PriceDistributionChart.svelte";

  import sectionTicketCounts from '../data/section_ticket_counts.json';
  import { storySteps } from '../data/story_steps.js'; 
  import rawTicketData from '../data/ticket_price_timeline.json';
  
  const ticketData = rawTicketData.map(ticket => ({
    ...ticket,
    rawPrice: ticket.price_usd 
  }));

  let activeStep = $state(0);
  let stepElements = $state([]);

  let currentStep = $derived(storySteps[activeStep] || {});

  let isFullscreen = $derived(
    currentStep.layout === "fullscreen" || 
    currentStep.layout === "fullscreen-intro" || 
    currentStep.layout === "fullscreen-clock"
  );

  let isSideBySide = $derived(currentStep.layout === "side-by-side");

  let activeTicket = $derived.by(() => {
    if (currentStep.highlightIds && currentStep.highlightIds.length > 0) {
      return ticketData.find(t => String(t.id) === String(currentStep.highlightIds[0])) || null;
    }
    return null;
  });

  const phantomStepsBase = [
    { timeLabel: "08:09", time: "2026-07-18T08:09:00", prevTime: null, totalTickets: 462,  surgeSections: [], vanishSections: [] },
    { timeLabel: "09:11", time: "2026-07-18T09:11:00", prevTime: "2026-07-18T08:09:00", totalTickets: 625, status: "SURGE", surgeSections: ["327", "126", "124", "204", "109", "227A", "205A", "225A", "301", "108"], vanishSections: [] },
    { timeLabel: "10:11", time: "2026-07-18T10:11:00", prevTime: "2026-07-18T09:11:00", totalTickets: 412, status: "VANISHED",  surgeSections: [], vanishSections: ["327", "126", "124", "204", "109", "227A", "205A", "225A", "301", "108"] },
    { timeLabel: "11:12", time: "2026-07-18T11:12:00", prevTime: "2026-07-18T10:11:00", totalTickets: 631, status: "SURGE",  surgeSections: ["124", "327", "126", "204", "227A", "225A", "322", "109", "108", "301"], vanishSections: [] },
    { timeLabel: "12:13", time: "2026-07-18T12:13:00", prevTime: "2026-07-18T11:12:00", totalTickets: 420, status: "VANISHED", surgeSections: [], vanishSections: ["124", "327", "126", "204", "227A", "225A", "322", "109", "108", "301"] }
  ];

  let processedPhantomSteps = $derived.by(() => {
    return phantomStepsBase.map(step => {
      const targetSections = [...(step.surgeSections || []), ...(step.vanishSections || [])];
      const changes = {};
      targetSections.forEach(sec => {
        const prevCount = step.prevTime ? ticketData.filter(t => t.scraped_time === step.prevTime && String(t.section).trim() === sec).reduce((sum, t) => sum + (t.availableTickets || 1), 0) : 0;
        const currCount = ticketData.filter(t => t.scraped_time === step.time && String(t.section).trim() === sec).reduce((sum, t) => sum + (t.availableTickets || 1), 0);
        const diff = currCount - prevCount;
        const sign = diff > 0 ? '+' : '';
        changes[sec] = `Prev: ${prevCount} → Curr: ${currCount} (${sign}${diff} tickets)`;
      });
      return { ...step, sectionChanges: changes };
    });
  });

  let currentSectionChanges = $derived.by(() => {
    if (!currentStep.phantomMode) return {};
    const prevStep = activeStep > 0 ? storySteps[activeStep - 1] : null;
    const prevTime = prevStep ? prevStep.time : null;
    const currTime = currentStep.time;
    const targetSections = [...(currentStep.surgeSections || []), ...(currentStep.vanishSections || [])];
    const changes = {};
    targetSections.forEach(sec => {
      const prevCount = prevTime ? ticketData.filter(t => t.scraped_time === prevTime && String(t.section).trim() === sec).reduce((sum, t) => sum + (t.availableTickets || 1), 0) : 0;
      const currCount = ticketData.filter(t => t.scraped_time === currTime && String(t.section).trim() === sec).reduce((sum, t) => sum + (t.availableTickets || 1), 0);
      const diff = currCount - prevCount;
      const sign = diff > 0 ? '+' : '';
      changes[sec] = `Prev: ${prevCount} → Curr: ${currCount} (${sign}${diff} tickets)`;
    });
    return changes;
  });

  onMount(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          activeStep = index;
        }
      });
    },
    { root: null, rootMargin: "0px 0px -80% 0px", threshold: 0 } 
  );

  stepElements.forEach((el) => {
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
});
</script>

<main class="scrolly-container" class:side-by-side-layout={isSideBySide}>  
  
  <div class="intro-visual-container" 
       class:shifted-down={currentStep.layout === "fullscreen-intro"}
       class:hide={activeStep >= 3}>
    <IntroVisual {activeStep} />
  </div>

  <div class="sticky-visuals" class:transparent-bg={activeStep < 3}>

    <div 
      class="fullscreen-step-bg"
      style:background-image={storySteps[activeStep]?.bgImage ? `linear-gradient(rgba(0, 0, 0, 0.50), rgba(0, 0, 0, 0.95)), url('${storySteps[activeStep].bgImage}')` : null}
      class:visible={!!storySteps[activeStep]?.bgImage}>
    </div>
    
    <div class="dashboard-elements" class:visible={activeStep >= 3 && currentStep.layout !== "fullscreen"}>    
      {#if !currentStep.phantomMode && !isSideBySide && currentStep.layout !== "waterfall-image"}
        <div class="dashboard-header" 
             class:hide-header={!!currentStep.iframeUrl || currentStep.layout === "distribution-chart" || currentStep.layout === "stadium-map" || currentStep.layout === "sankey-chart"}>
          
          <div class="stat-box-container" class:hide={currentStep.layout === "fullscreen-clock"}>
            <div class="stat-box" class:highlight={activeStep === 4}>
              <span class="stat-label">Tickets Available</span>
              <span class="stat-value">{currentStep.ticketCount || 0}</span>
            </div>
          </div>

          <div class="clock-wrapper" class:time-travel-mode={currentStep.layout === "fullscreen-clock"}>
            <OpeningClock 
              scrapedTime={currentStep.time} 
              isTimeTravel={currentStep.layout === "fullscreen-clock"}
            />
          </div>
          
        </div>
      {/if}
      
      <div class="main-chart-wrapper" style="position: relative;" 
           class:fade-out={currentStep.layout === "fullscreen-clock" || currentStep.layout === "distribution-chart" || currentStep.layout === "stadium-map" || currentStep.layout === "sankey-chart"}>
        
        {#if currentStep.iframeUrl}
          <div class="embedded-datawrapper fullscreen-iframe">
            <iframe 
              title="Datawrapper Chart" 
              aria-label="Column Chart" 
              src={currentStep.iframeUrl} 
              scrolling="no" 
              frameborder="0" 
              style="width: 100%; height: 100%; border: none;">
            </iframe>
          </div>

        {:else if currentStep.layout === "waterfall-image"}
          <div class="waterfall-container">
            <div class="waterfall-image-wrapper">
              <img src="{base}/images/matrix_waterfall.png" alt="Ticket Liquidity Waterfall" />
            </div>
          </div>

        {:else if !currentStep.iframeUrl && !currentStep.phantomMode && !isSideBySide && currentStep.layout !== "waterfall-image"}
          <PriceChart 
            data={ticketData} 
            highlightIds={currentStep.highlightIds || []} 
            currentTime={currentStep.time} 
            emphasizeAll={activeStep === 4}
          />
        {/if}

        {#if currentStep.graphImage}
          <div class="graph-image-overlay">
            <img src="{base}{currentStep.graphImage}" alt="Reference visual" />
            <div class="photo-credit">Photo : Getty Images</div>
          </div>
        {/if}
      </div>

      <div class="seat-view-overlay {currentStep.overlayPosition || 'center'}" 
           class:visible={currentStep.showSeatView || currentStep.layout === "stadium-map"} 
           class:phantom-focus={currentStep.phantomMode}
           class:map-only={currentStep.layout === "stadium-map"}>
        
        {#if currentStep.layout === "stadium-map"}
          <div class="heatmap-legend-overlay">
            <span class="legend-title">TICKETS PER SECTION</span>
            <div class="legend-scale-bar"></div>
            <div class="legend-labels">
              <span>1(Low)</span>
              <span>29(Mid)</span>
              <span>58(High)</span>
            </div>
          </div>
        {/if}

        {#if currentStep.phantomMode}
          <div class="scroll-legend-overlay">
            <div class="legend-badge"><span class="dot red"></span><span><strong>SURGE:</strong> <br>up by 10+ tickets in 1hr</span></div>
            <div class="legend-badge"><span class="dot blue"></span><span><strong>VANISH:</strong> <br>down by 10+ tickets in 1hr</span></div>
          </div>
        {/if}

        <div class="seat-view-content">
          {#if currentStep.layout !== "stadium-map"}
            <div class="view-photo">
              {#if activeTicket && (activeTicket.vfsUrl || activeTicket.vfs_url)}
                {#key activeTicket.id}
                  <img src="{base}{activeTicket.vfsUrl || activeTicket.vfs_url}" alt="View from Section {activeTicket.section}" />
                  <div class="photo-label">VIEW FROM SEC {activeTicket.section}</div>
                {/key}
              {:else}
                <div class="loading-state">Loading View...</div>
              {/if}
            </div>
          {/if}
          
          <div class="seat-map-wrapper">
            <StadiumMap 
              ticketCounts={currentStep.layout === "stadium-map" ? sectionTicketCounts : []}
              highlightIds={currentStep.highlightIds || []} 
              surgeSections={currentStep.surgeSections || []} 
              vanishSections={currentStep.vanishSections || []} 
              sectionChanges={currentSectionChanges} 
              ticketData={ticketData} 
            />
            {#if !currentStep.phantomMode && currentStep.layout !== "stadium-map"}
              <div class="photo-label">LOCATION</div>
            {/if}
          </div>
        </div>
      </div>

      <div class="distribution-overlay" class:visible={currentStep.layout === "distribution-chart"}>
        <PriceDistributionChart />
      </div>

      <div class="sankey-overlay" class:visible={currentStep.layout === "sankey-chart"}>
        <iframe 
          src="{base}/sankey.html" 
          title="Sankey Chart" 
          width="100%" 
          height="100%" 
          frameborder="0">
        </iframe>
      </div>

    </div>
  </div>

  <div class="scrolling-text">
    
    {#each storySteps as step, index}
      <div 
        class="step-container" 
        class:is-fullscreen={step.layout === "fullscreen" || step.layout === "fullscreen-intro" || step.layout === "fullscreen-clock"}
        data-index={index}
        bind:this={stepElements[index]}
      >
        <div 
          class="step-card" 
          class:active={activeStep === index}
          class:intro-card={step.layout === "fullscreen-intro"}
          class:clock-text={step.layout === "fullscreen-clock"}
          class:dataset-card={step.title === "THE DATASET"} 
        >
          {#if step.title}
            <h2>{step.title}</h2>
          {/if}
          
          {#if step.subtitle}
            <h3 class="main-subtitle">{step.subtitle}</h3>
          {/if}

          {#if step.layout !== "fullscreen-clock"}
            <p>{@html step.text}</p>
          {:else}
            {@html step.text}
          {/if}

          {#if step.title === "THE VERTICAL JUMP"} 
            <div class="historical-chart-wrapper">
              <HistoricalPriceChart />
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

</main> 

<section class="phantom-section">
  <div class="phantom-header">
    
    <p>
      Let's take a closer look at the dramatic changes that occurred within just four hours. The observation of such unnatural movements on the day before the final shines a light on the opacity of the resale ticket market.
    </p>
  </div>
  ...

  <div class="small-multiples-grid">
    {#each processedPhantomSteps as step}
      <div class="multiple-card" class:surge={step.status === "SURGE"}>
        <div class="card-header">
          <h3>{step.timeLabel}</h3>
          <span class="status-badge {step.status}">{step.status}</span>
        </div>
        
        <div class="mini-map-container">
          <StadiumMap 
            ticketCounts={[]} 
            surgeSections={step.surgeSections} 
            vanishSections={step.vanishSections} 
            sectionChanges={step.sectionChanges} 
            ticketData={ticketData} 
          />
        </div>

        <div class="card-info">
          <p class="multiple-desc">{step.description}</p>
          <p class="multiple-tickets"><span>{step.totalTickets} tickets</span></p>
        </div>
      </div>
    {/each}
  </div>
</section>

<section class="conclusion-section">
  <div class="conclusion-bg" style="background-image: url('{base}/images/trophy.png');">
    <div class="photo-credit">Photo: FIFA</div>
  </div>

  <div class="conclusion-container">
    <div class="conclusion-header">
      <span class="conclusion-kicker">CONCLUSION</span>
    </div>

    <div class="conclusion-content">
      <p>
        The 2026 FIFA World Cup, which became the largest tournament in history, was a major competition where commercialism in sports became the central topic of debate. Soccer, a sport that requires only a ball, has become a global phenomenon aided by its simplicity. As popularity grows, opportunities to expand revenue also emerge. The ability to purchase tickets right up until the final match means that for some wealthy individuals, they can maintain their options until the last moment. This may be a welcome development. However, it applies only to an extremely small portion of people in the world.
      </p>
      
    </div>

    <div class="github-card">
      <a 
        href="https://github.com/sisksyfftmk/fifafinaltickets" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="github-btn"
      >
        Repository is Here
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </a>
    </div>
  </div>
</section>

<style>
  :global(body) {
    background-color: #080808;
    color: white;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .scrolly-container { 
    position: relative; 
    width: 100%; 
    display: flex;
    flex-direction: row-reverse;
  }

  /* サイドバイサイド用のレイアウト切替 */
  .scrolly-container.side-by-side-layout {
    flex-direction: row-reverse; 
    max-width: 1400px;
    margin: 0 auto;
  }

  .scrolly-container.side-by-side-layout .scrolling-text {
    width: 40%;
    padding-left: 5%;
  }

  .scrolly-container.side-by-side-layout .sticky-visuals {
    width: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sticky-visuals {
    position: sticky;
    top: 0;
    width: 60%;
    height: 100vh;
    z-index: 1;
    overflow: hidden;
    background-color: #080808;
    transition: background-color 0.8s ease; 
  }

  .sticky-visuals.transparent-bg {
    background-color: transparent;
  }

  .intro-visual-container {
    position: fixed;
    top: 0; 
    left: 0; 
    width: 100vw; 
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.8s ease, transform 0.8s ease;
    opacity: 1;
    z-index: 0; 
    pointer-events: none;
  }
  
  .intro-visual-container.hide {
    opacity: 0;
    pointer-events: none;
  }

  .intro-visual-container.shifted-down {
    transform: translateY(12vh);
  }

  .scrolling-text { 
    position: relative; 
    z-index: 30; 
    width: 40%; 
    padding-bottom: 50vh; 
    pointer-events: none; 
  }

  .step-container {
    min-height: 120vh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
    padding: 20px 0 0px 0;
    margin-top: 150px;
  }

  .step-container.is-fullscreen {
    width: 100vw;
    margin-left: 0; 
    margin-top: 100vh;  
    min-height: 160vh;
  }

  .step-card {
    pointer-events: auto;
    width: 90%; 
    max-width: 580px; 
    padding: 2.5rem; 
    background: rgba(17, 17, 17, 0.95);
    border: 1px solid #333;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(5px);
    opacity: 1;
    transition: opacity 0.4s ease;
    margin-bottom: -200px;
  }

  .step-card.active { 
    opacity: 1 !important; 
  }

  .step-container.is-fullscreen .step-card {
    max-width: 1300px;
    width: 90%;
    background: rgba(15, 15, 15, 0.95);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 30px 60px rgba(0,0,0,0.9);
    margin: 0 auto; 
    text-align: left;
  }

  .step-container.is-fullscreen .step-card.intro-card {
    background: transparent; 
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    text-align: center;
    margin-top: -20vh; 
  }

  .step-card.intro-card h2 {
    font-size: 5rem; 
    font-weight: 900;
    color: rgb(198, 12, 48);
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    text-shadow: 0 4px 30px rgba(0,0,0,0.9);
  }

  .main-subtitle {
    font-size: 3rem;
    font-weight: 400;
    color: rgb(52,144,220); 
    letter-spacing: 1px;
    margin-top: 0;
    margin-bottom: 2rem;
    text-shadow: 0 2px 10px rgba(0,0,0,0.9);
  }

  .step-card.intro-card p {
    font-size: 2rem;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.8;
    background: transparent; 
    padding: 0;             
    border: none;            
    backdrop-filter: none;   
    text-shadow: 0 2px 10px rgba(0,0,0,0.9);
    color: #fff;
  }

  .step-container.is-fullscreen .step-card.clock-text {
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    text-align: center;
    transform: translateY(-25vh); 
  }
  
  .step-card h2 { 
    font-size: 1.9rem; 
    margin-top: 0; 
    margin-bottom: 1rem; 
    color:rgb(198, 12, 48); 
  }
  
  .step-card p { 
    font-size: 1.5rem; 
    line-height: 1.8; 
    margin-bottom: 0; 
  }
  
  .dashboard-elements {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 1.5rem;
    opacity: 0;
    visibility: hidden;
    z-index: 2;
    transition: opacity 0.5s ease, visibility 0.5s;
  }

  .dashboard-elements.visible {
    opacity: 1;
    visibility: visible;
  }

  .dashboard-header {
    display: flex;
    justify-content: center;
    gap: 80px; 
    align-items: center;
    width: 100%;
    margin-bottom: 0.8rem;
    flex-shrink: 0;
    transition: opacity 0.3s ease;
  }

  .dashboard-header.hide-header {
    opacity: 0;
    pointer-events: none;
  }

  .stat-box-container {
    transition: opacity 0.3s ease;
    opacity: 1;
  }
  
  .stat-box-container.hide {
    opacity: 0;
    pointer-events: none;
  }

  .stat-box { 
    display: flex; 
    flex-direction: column; 
    align-items: flex-start;
    background: rgba(18, 18, 18, 0.85);
    border: 1px solid #333;
    padding: 30px 40px;
    border-radius: 12px;
    backdrop-filter: blur(5px);
    width: fit-content; 
  }

  .stat-label { font-size: 1.75rem; color: #888; text-transform: uppercase; margin-bottom: 2px;}
  .stat-value { font-size: 6rem; font-weight: 900; color: rgb(198,12,48); font-family: 'Courier New', Courier, monospace; line-height: 1; letter-spacing: -5px;}

  .stat-box.highlight {
    border-color: #ffffff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }

  .clock-wrapper { 
    position: relative;
  }
  
  .clock-wrapper.time-travel-mode {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.6);
    filter: drop-shadow(0 0 30px rgba(255, 218, 121, 0.3));
    z-index: 100;
    animation: cinematicClock 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes cinematicClock {
    0% { 
      opacity: 0; 
      transform: translate(-50%, -50%) scale(1.2);
    }
    100% { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1.6);
    }
  }

  .main-chart-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    transition: opacity 0.3s ease;
  }
  
  .main-chart-wrapper.fade-out {
    opacity: 0;
    pointer-events: none;
  }

  .embedded-datawrapper {
    width: 100%;
    height: 100%;
    max-height: 480px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: rgba(18, 18, 18, 0.8);
    border: 1px solid #334155;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.5);
    overflow: hidden;
  }

  .embedded-datawrapper iframe {
    width: 100%;
    height: 460px;
    margin-bottom: -40px; 
    border: none;
  }

  .waterfall-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .waterfall-image-wrapper {
    position: relative;
    max-width: 100%;
    background-color: #080808; 
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
  }

  .waterfall-image-wrapper img {
    display: block;
    width: 100%;
    max-height: 75vh;
    object-fit: contain;
    border-radius: 8px;
    image-rendering: crisp-edges; 
  }

  .hud-text {
    display: flex;
    flex-direction: column;
    background: rgba(8, 8, 8, 0.85);
    padding: 6px 10px;
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 4px;
    backdrop-filter: blur(4px);
  }

  .hud-title {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    font-weight: bold;
    color: #38bdf8;
    letter-spacing: 1px;
  }

  .hud-desc {
    font-size: 0.75rem;
    color: #cbd5e1;
    margin-top: 2px;
  }

  .hud-annotation.influx {
    top: 20%;
    right: 15%;
    flex-direction: row-reverse;
  }

  .hud-annotation.influx .hud-line {
    width: 80px;
    height: 80px;
    border-left: 1px dashed #38bdf8;
    border-bottom: 1px dashed #38bdf8;
    margin-right: -40px;
    margin-top: 20px;
    opacity: 0.8;
  }

  .hud-annotation.turnover {
    bottom: 25%;
    left: 20%;
  }

  .hud-annotation.turnover .hud-box {
    width: 40px;
    height: 60px;
    border: 1px solid #eab308;
    margin-right: 15px;
    margin-top: 10px;
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
  }
  
  .hud-annotation.turnover .hud-title {
    color: #eab308;
    border-color: rgba(234, 179, 8, 0.3);
  }

  .sankey-overlay {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 950px;
    height: 75vh;
    background: rgba(18, 18, 18, 0.95);
    border: 1px solid #4b5563;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 150;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s;
  }
  
  .sankey-overlay.visible {
    opacity: 1;
    visibility: visible;
  }

  :global(.time-travel-text) {
    font-size: 8rem; 
    font-weight: 900;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-style: italic; /* 斜体にすると雰囲気が出ます */
    line-height: 1.4;
    letter-spacing: 0.05em;
    text-shadow: 0 0 20px rgba(52, 144, 220, 0.8), 0 5px 15px rgba(0,0,0,0.9);
    color: rgb(198, 12, 48);
    transform: rotate(-2deg); 
  }

  :global(.data-cards-container) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  :global(.info-card) {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
  }

  :global(.relation-card) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  :global(.relation-title) {
    font-size: 1rem; color: #ccc; margin-bottom: 1.5rem; text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; font-weight: bold;
  }

  :global(.relation-body) { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  :global(.metric-box) { display: flex; flex-direction: column; align-items: center; flex: 1; }
  :global(.link-arrow) { display: flex; flex-direction: column; align-items: center; color: #888; flex: 0.6; }
  :global(.link-arrow .arrow) { font-size: 2rem; margin-bottom: 0.2rem; color: #555; }
  :global(.link-arrow .note) { font-size: 0.8rem; text-align: center; white-space: nowrap; line-height: 1.4; color: #9ca3af; }
  
  :global(.card-label) { font-size: 0.9rem; text-transform: uppercase; color: #a0a0a0; margin-bottom: 0.5rem; }
  :global(.card-value) {
    font-size: 3rem; font-weight: 700; line-height: 1; margin-bottom: 0.3rem;
    font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 15px rgba(0,0,0,0.5);
  }

  :global(.id-color) { color: rgb(198, 12, 48); } 
  :global(.ticket-color) { color: rgb(52, 144, 220); } 
  :global(.card-unit) { font-size: 1.2rem; font-weight: normal; margin-left: 4px; color: #fff; }
  :global(.card-sub) { font-size: 0.85rem; color: #888888; display: block; margin-top: 5px; }

  .seat-view-overlay {
    position: absolute; width: 85%; background: rgba(18, 18, 18, 0.95);
    border: 1px solid #4b5563; border-radius: 12px; padding: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9); backdrop-filter: blur(10px);
    opacity: 0; visibility: hidden; z-index: 100;
    transition: opacity 0.2s ease, visibility 0.2s;
  }
  .seat-view-overlay.visible { opacity: 1; visibility: visible; }
  
  .seat-view-overlay.center { top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 900px; }
  .seat-view-overlay.right { top: 53%; right: 7%; left: auto; transform: translateY(-50%); width: 80%; max-width: 900px; }
  .seat-view-overlay.top-right { top: 5%; right: 2%; left: auto; transform: none; width: 80%; max-width: 500px; }
  .seat-view-overlay.top-right .seat-view-content { flex-direction: column; height: 420px; gap: 15px; }
  .seat-view-overlay.top-right .view-photo { flex: 1; }
  .seat-view-overlay.top-right .seat-map-wrapper { flex: 1; }
  .seat-view-overlay.bottom { top: auto; bottom: 5%; left: 50%; transform: translateX(-50%); width: 80%; max-width: 900px; }
  
  .seat-view-overlay.map-only { 
    top: 50%; left: 50%; transform: translate(-50%, -50%); 
    width: 75%; max-width: 800px; height: 75vh; 
  }
  .seat-view-overlay.map-only .seat-view-content { display: block; height: 100%; }
  .seat-view-overlay.map-only .seat-map-wrapper { height: 100%; width: 100%; background: transparent; border: none; }
  
  .seat-view-overlay.phantom-focus {
    background: transparent; border: none; box-shadow: none; backdrop-filter: none;
    position: absolute; top: 50%; left: 45%; transform: translate(-50%, -50%); width: 70%; max-width: 800px;
  }
  .seat-view-overlay.phantom-focus .seat-view-content { display: block; height: auto; }
  .seat-view-overlay.phantom-focus .seat-map-wrapper { background: transparent; border: none; height: 65vh; width: 100%; }
  .seat-view-overlay.phantom-focus .view-photo { display: none; }

  /* 🌟 全体の余白と角丸を調整 */
  .scroll-legend-overlay {
    display: flex; justify-content: center; gap: 30px; margin-bottom: 15px; background: rgba(15, 15, 15, 0.9);
    border: 2px solid #444; padding: 20px 50px; border-radius: 30px; backdrop-filter: blur(8px);
    width: fit-content; margin-left: auto; margin-right: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    position: absolute; top: -50px; left: 80%; transform: translateX(-50%) scale(1.5); z-index: 200;
  }
  /* 🌟 文字サイズを大きく（0.85rem → 1.15rem） */
  .legend-badge { display: flex; align-items: center; gap: 10px; font-size: 1rem; color: #eee; font-family: 'Courier New', Courier, monospace; }
  /* 🌟 丸いアイコン（赤・青）を大きく（12px → 16px） */
  .dot { width: 20px; height: 16px; border-radius: 50%; display: inline-block; }
  .dot.red { background-color: #ef4444; box-shadow: 0 0 8px #ef4444; }
  .dot.blue { background-color: #3b82f6; box-shadow: 0 0 8px #3b82f6; }

  /* 🌟 全体の余白を調整 */
  .heatmap-legend-overlay {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 10, 0.9);
    border: 5px solid rgba(255, 255, 255, 0.15);
    padding: 22px 22px; /* 👈 余白を大きく */
    border-radius: 8px;
    z-index: 200;
    backdrop-filter: blur(4px);
    font-family: 'Courier New', Courier, monospace;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  /* 🌟 タイトル文字を大きく（0.75rem → 1.1rem） */
  .legend-title {
    display: block;
    font-size: 1.1rem; 
    font-weight: bold;
    color: #94a3b8;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-align: center;
  }

  /* 🌟 グラデーションのバーを太く・長くする */
  .legend-scale-bar {
    width: 220px; /* 👈 160px から 220px に延長 */
    height: 14px; /* 👈 10px から 14px に太く */
    border-radius: 4px;
    background: linear-gradient(to right, hsl(350, 85%, 90%), hsl(350, 85%, 35%));
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 8px;
  }

  /* 🌟 1 / 29 / 58+ の文字を大きく（0.7rem → 0.95rem） */
  .legend-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem; 
    font-weight: bold;
    color: #cbd5e1;
  }

  .seat-view-content { display: flex; gap: 20px; height: 350px; }
  .view-photo, .seat-map-wrapper {
    position: relative; flex: 1; border-radius: 8px; overflow: hidden; border: 1px solid #333; background-color: #111827; 
  }
  .view-photo { flex: 1.2; }
  .seat-map-wrapper { flex: 0.8; position: relative; }
  .view-photo img { width: 100%; height: 100%; object-fit: cover; }
  .loading-state { display: flex; justify-content: center; align-items: center; height: 100%; color: #64748b; font-family: monospace; }
  .photo-label {
    position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0, 0, 0, 0.75);
    color: #ffda79; font-family: 'Courier New', Courier, monospace; font-size: 0.85rem;
    padding: 8px 10px; box-sizing: border-box; text-align: center; letter-spacing: 1px; font-weight: bold; z-index: 20;
  }

  .distribution-overlay {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 85%;
    max-width: 900px;
    height: auto;
    background: rgba(18, 18, 18, 0.95);
    border: 1px solid #4b5563;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 150;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s;
  }
  .distribution-overlay.visible {
    opacity: 1;
    visibility: visible;
  }

  .fullscreen-step-bg {
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100vw; 
    height: 100vh;
    background-size: cover;
    background-position: center;
    z-index: 0; 
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.8s ease, visibility 0.8s ease;
  }
  
  .fullscreen-step-bg.visible {
    opacity: 1;
    visibility: visible;
  }

  .graph-image-overlay {
    position: absolute;
    top: 5%;      
    right: 8%;      
    width: 750px;    
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
    overflow: hidden;
    z-index: 10;
    animation: fadeInGraphImage 0.6s ease-out forwards;
  }
  
  .graph-image-overlay img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  .photo-credit {
    position: absolute;
    bottom: 6px;
    right: 8px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
    font-family: sans-serif;
    pointer-events: none;
  }

  .historical-chart-wrapper {
    width: 100%;
    margin-top: 2rem; 

  }

  /* 🌟 最初のステップ（タイトル画面）専用の設定 */
  .step-container[data-index="0"] {
    margin-top: 0 !important;      /* 待機スクロールをなくし、最初から表示 */
    min-height: 100vh !important;  /* 画面の高さいっぱいに広げる */
    align-items: center !important; /* テキストを画面の縦中央に配置 */
  }

  /* タイトルカード自体のズレをリセット */
  .step-container[data-index="0"] .step-card.intro-card {
    margin-top: -10vh; /* 少しだけ上寄りに配置（完全な中央が良い場合は 0 にしてください） */
  }

  .step-container[data-index="1"] {
    margin-top: 50px; /* 300pxなどから大幅に短くする（お好みで調整） */
  }

  /* 🌟 THE DATASETのカードだけ幅を少し縮める */
  .step-container.is-fullscreen .step-card.dataset-card {
    max-width: 850px !important; /* 1300pxから850pxに縮小（お好みで調整してください） */
  }

  /* 🌟 Datawrapperを右側全体（またはコンテナ全体）に美しく広げる設定 */
  .embedded-datawrapper.fullscreen-iframe {
    width: 90%; /* 右側の黒い空間にちょうど良く収まる幅 */
    max-width: 1000px;
    height: 75vh;
    max-height: none; /* デフォルトの max-height: 480px を解除 */
    margin: 0 auto;
    border-radius: 12px;
    background: transparent; /* Datawrapper自体の背景（ダークモード）を活かす */
    border: none;
    box-shadow: none;
  }

  .embedded-datawrapper.fullscreen-iframe iframe {
    height: 100%;
    margin-bottom: 0;
  }
  
  /* 🌟 結論セクション全体 */
  .conclusion-section {
    position: relative;
    padding: 120px 5% 80px 5%;
    background-color: #080808;
    color: #e2e8f0;
    border-top: 1px solid #222;
    overflow: hidden;
  }

  /* 🌟 背景画像の設定 */
  .conclusion-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: 0;
  }

  /* 🌟 文字を読みやすくするための暗いフィルター（上下を黒くグラデーション） */
  .conclusion-bg::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, #080808 0%, rgba(8,8,8,0.7) 40%, rgba(8,8,8,0.7) 80%, #080808 100%);
    z-index: 1;
  }

  /* 🌟 右下の写真クレジット */
  .photo-credit {
    position: absolute;
    bottom: 12px;
    right: 20px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'Courier New', Courier, monospace;
    z-index: 2; 
    pointer-events: none;
  }

  /* 🌟 コンテンツ部分は背景の上に表示する */
  .conclusion-container {
    position: relative;
    max-width: 850px;
    margin: 0 auto;
    z-index: 10;
  }

  .conclusion-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .conclusion-kicker {
    font-family: 'Courier New', Courier, monospace;
    font-size: 4rem;
    font-weight: bold;
    color: rgb(198,12,48);
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .conclusion-header h2 {
    font-size: 2.5rem;
    font-weight: 900;
    color: #ffffff;
    margin-top: 10px;
    letter-spacing: 1px;
  }

  .conclusion-content {
    font-size: 1.8rem;
    line-height: 1.3;
    color: #cbd5e1;
    margin-bottom: 60px;
  }

  .conclusion-content p {
    margin-bottom: 24px;
  }

  

  .github-card:hover {
    border-color: #555;
  }

  .github-info {
    flex: 1;
  }

  .github-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #38bdf8;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.85rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .github-info h3 {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 10px;
  }

  .github-info p {
    font-size: 0.95rem;
    color: #94a3b8;
    line-height: 1.6;
    margin: 0;
  }

  /* 🌟 GitHubボタン */
  .github-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgb(52,144,220);
    color: #000;
    font-weight: bold;
    font-size: 1rem;
    padding: 14px 24px;
    border-radius: 8px;
    text-decoration: none;
    white-space: nowrap;
    transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  }

  .github-btn:hover {
    background-color: rgb(198,12,48);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 218, 121, 0.3);
  }

  /* =========================================
     🌟 アニメーション (Keyframes)
     ========================================= */
  @keyframes fadeInGraphImage {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse { 
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } 
  }

  /* =========================================
     🌟 Phantom Inventory セクション
     ========================================= */
  .phantom-section { 
    padding: 100px 5%; 
    background-color: #050505; 
    border-top: 1px solid #222; 
  }

  .phantom-header { 
    max-width: 800px; 
    margin: 0 auto 60px auto; 
    text-align: center; 
  }

  .phantom-header h2 { 
    font-size: 3rem; 
    color: #ffda79; 
    margin-bottom: 20px; 
    letter-spacing: 2px; 
  }

  .phantom-header p { 
    font-size: 2rem; 
    line-height: 1.8; 
    color: #ccc; 
  }

  /* 🌟 Small Multiples (ミニマップのグリッド) */
  .small-multiples-grid { 
    display: grid; 
    grid-template-columns: repeat(5, 1fr); 
    gap: 15px; 
    width: 100%; 
    max-width: 1400px; 
    margin: 0 auto; 
  }

  .multiple-card { 
    background: #111; 
    border: 1px solid #333; 
    border-radius: 8px; 
    padding: 15px; 
    display: flex; 
    flex-direction: column; 
    transition: transform 0.3s ease, border-color 0.3s ease; 
  }

  .multiple-card.surge { 
    border-color: #ef4444; 
    background: rgba(239, 68, 68, 0.05); 
  }

  .card-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 15px; 
    border-bottom: 1px solid #333; 
    padding-bottom: 10px; 
  }

  .card-header h3 { 
    margin: 0; 
    font-family: 'Courier New', Courier, monospace; 
    font-size: 1.2rem; 
  }

  /* 🌟 バッジとステータス */
  .status-badge { 
    font-size: 0.7rem; 
    font-weight: bold; 
    padding: 3px 8px; 
    border-radius: 12px; 
  }

  .status-badge.QUIET { background: #333; color: #aaa; }
  .status-badge.SURGE { background: #ef4444; color: white; animation: pulse 2s infinite; }
  .status-badge.VANISHED { background: #000; color: #666; border: 1px dashed #666; }

  /* 🌟 ミニマップ内の詳細情報 */
  .mini-map-container { 
    flex: 1; 
    min-height: 180px; 
    background: #0a0a0a; 
    border-radius: 6px; 
    margin-bottom: 15px; 
    overflow: hidden; 
  }

  .card-info { 
    font-size: 0.85rem; 
    line-height: 1.4; 
    color: #bbb; 
  }

  .multiple-tickets { 
    margin-top: 10px; 
    font-size: 0.8rem; 
    color: #888; 
  }

  .multiple-tickets span { 
    font-weight: bold; 
    color: #fff; 
    font-size: 1.1rem; 
  }

  /* =========================================
     📱 レスポンシブ対応 (タブレット・スマホ)
     ========================================= */

  /* 💻 タブレットサイズ (1024px以下) */
  @media (max-width: 1024px) {
    .scrolly-container { display: block; }
    .sticky-visuals { width: 100%; }
    .scrolling-text { width: 100%; margin-top: -100vh; }
    
    .step-card { 
      width: 90%; 
      max-width: none; 
      margin: 0 auto; 
      padding: 1.5rem; 
      background: rgba(17, 17, 17, 0.88); 
    }
    
    .step-container.is-fullscreen .step-card { padding: 1.5rem 1rem; }
    .step-card.intro-card h2 { font-size: 2.2rem; }
    .main-subtitle { font-size: 1rem; }
    
    .clock-wrapper.time-travel-mode { transform: translate(-50%, -50%) scale(1.3); }
    .clock-wrapper { transform: scale(0.9); }
    .stat-value { font-size: 2.2rem; }
    
    /* :global の使用を安全にするための修正 */
    :global(.relation-body) { flex-direction: column !important; gap: 1.5rem !important; }
    :global(.link-arrow .arrow) { transform: rotate(90deg) !important; margin: 0.5rem 0 !important; }
    
    .small-multiples-grid { 
      overflow-x: auto; 
      grid-template-columns: repeat(5, 280px); 
      padding-bottom: 20px; 
    }
    
    .scrolly-container.side-by-side-layout { flex-direction: column; }
    .scrolly-container.side-by-side-layout .scrolling-text { width: 100%; padding-left: 0; margin-top: -100vh; }
    .scrolly-container.side-by-side-layout .sticky-visuals { width: 100%; }
  }

  /* 📱 スマホサイズ (768px以下) */
  @media (max-width: 768px) {
    .github-btn {
      width: 100%;
      justify-content: center;
    }

    .conclusion-header h2 {
      font-size: 1.8rem;
    }

    .conclusion-content {
      font-size: 1.05rem;
    }
  }

</style>
<script>
  let { scrapedTime, isTimeTravel = false } = $props();

  const KICKOFF_TIME = new Date('2026-07-19T15:00:00-04:00');

  let targetH = $derived.by(() => {
    if (!scrapedTime) return { t: "0", o: "0" };
    const diffMs = Math.max(0, KICKOFF_TIME - new Date(scrapedTime));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const str = String(hours).padStart(2, '0');
    return { t: str[0], o: str[1] };
  });

  let targetM = $derived.by(() => {
    if (!scrapedTime) return { t: "0", o: "0" };
    const diffMs = Math.max(0, KICKOFF_TIME - new Date(scrapedTime));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const str = String(mins).padStart(2, '0');
    return { t: str[0], o: str[1] };
  });

  let hoursTens = $state("0");
  let hoursOnes = $state("0");
  let minsTens = $state("0");
  let minsOnes = $state("0");

  $effect(() => {
    const h = targetH;
    const m = targetM;

    if (h.t === "3" && h.o === "8" && m.t === "0" && m.o === "7" && !isTimeTravel) {
      hoursTens = h.t;
      hoursOnes = h.o;
      minsTens = m.t;
      minsOnes = m.o;
      return; 
    }

    let iterations = 0;
    const maxIterations = 15;

    const interval = setInterval(() => {
      if (iterations < maxIterations) {
        hoursTens = Math.floor(Math.random() * 10).toString();
        hoursOnes = Math.floor(Math.random() * 10).toString();
        minsTens = Math.floor(Math.random() * 10).toString();
        minsOnes = Math.floor(Math.random() * 10).toString();
        iterations++;
      } else {
        hoursTens = h.t;
        hoursOnes = h.o;
        minsTens = m.t;
        minsOnes = m.o;
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  });

  let formattedCurrentTime = $derived.by(() => {
    if (!scrapedTime) return "";
    return new Date(scrapedTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  });
</script>

<div class="clock-container">
  <div class="loading-text">
    <p>TIME UNTIL KICKOFF</p>
  </div>

  <div class="clock-wrapper">
    <div class="time-unit">
      <div id="animation_demo">
        <div class="display"><div class="digit"><span class="num">{hoursTens}</span></div></div>
        <div class="display"><div class="digit"><span class="num">{hoursOnes}</span></div></div>
      </div>
      <span class="unit-label">HOURS</span>
    </div>

    <div class="colon">:</div>

    <div class="time-unit">
      <div id="animation_demo">
        <div class="display"><div class="digit"><span class="num">{minsTens}</span></div></div>
        <div class="display"><div class="digit"><span class="num">{minsOnes}</span></div></div>
      </div>
      <span class="unit-label">MINUTES</span>
    </div>
  </div>

  <div class="actual-time-text">
    {formattedCurrentTime}
  </div>
</div>

<style>
  .clock-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0; 
    color: #fff;
    font-family: sans-serif;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }

  .loading-text p {
    font-size: 1.9rem;
    letter-spacing: 2px;
    margin-bottom: 20px;
    color: #aaa;
    text-transform: uppercase;
  }

  .clock-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    animation: none; 
  }

  .time-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #animation_demo {
    display: flex;
    gap: 8px;
  }

  .colon {
    font-size: 4rem;
    font-weight: bold;
    color: #fff;
    line-height: 95px; 
  }

  .unit-label {
    margin-top: 8px;
    font-size: 0.75rem;
    letter-spacing: 2px;
    color: #777;
    font-weight: bold;
  }

  .display {
    position: relative;
    width: 65px;
    height: 95px;
    background: linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%);
    border-radius: 6px;
    border: 1px solid #444;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: none;  /* ← この1行だけ追加 */
    opacity: 1;  /* ← この1行だけ追加 */
  }

  .display::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #111;
    z-index: 2;
  }

  .digit {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .num {
    font-size: 4.0rem;
    font-weight: 900;
    color: #f8f9fa;
    font-family: 'Courier New', Courier, monospace;
  }

  .clock-header {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgb(198,12,48);
    font-size: 2.2rem; 
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 4px;
    }

  .actual-time-text {
    font-size: 1.5rem; 
    font-weight: bold; 
    color: rgb(198,12,48); 
    margin-top: 15px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  @media (max-width: 768px) {
    .clock-wrapper {
      gap: 10px; 
      transform: scale(0.85); 
      transform-origin: center center;
    }
  }
</style>
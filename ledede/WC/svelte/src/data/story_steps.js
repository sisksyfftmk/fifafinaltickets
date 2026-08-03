export const storySteps = [
  
  {
    title: "THE OTHER FRENZY",
    subtitle: "What Happened in the Ticket Resale Market Ahead of the World Cup Final",
    text: 'by YOHEI',
    highlightIds: [],
    time: null,
    ticketCount: 0,
    layout: "fullscreen-intro" 
  },

  {
    text: `On July 19, 2026, the World Cup final was held in New York (New Jersey). 
  Featuring 48 teams for the first time in history, the tournament unfolded 
  through intensive competition over a period of more than a month.
<br><br>
  Dynamic pricing was implemented on an unprecedented scale, and the resale market thrived. 
  With commercial aspects such as advertising revenue generated from hydration breaks, 
  the tournament took on the character of a financial game, drawing widespread criticism 
  alongside the public excitement.`,
    highlightIds: [],
    time: null,
    ticketCount: 0,
    layout: "fullscreen"
  },

  {
    title: "THE DATASET",
    text: `How active was the ticket resale market? To understand the actual situation, I gathered ticket information from the major resale platform StubHub every hour, starting approximately 38 hours before the kickoff of the World Cup final.
    <br><br>Below is an overview of the data that forms the foundation of this analysis.
    
    <div class="data-cards-container">
      <div class="data-card info-card">
        <span class="card-label">Data collection count:</span>
        <span class="card-value"> 26</span>
      </div>
      
      <div class="data-card relation-card">
        <div class="relation-title">Cumulative dataset</div>
        <div class="relation-body">
          <div class="metric-box">
            <span class="card-label">Number of listings (ID)</span>
            <span class="card-value id-color">5,017</span>
          </div>
          <div class="link-arrow">
            <span class="arrow">➔</span>
            <span class="note">A single listing can<br>contain multiple tickets</span>
          </div>
          <div class="metric-box">
            <span class="card-label">Number of tickets</span>
            <span class="card-value ticket-color">11,875</span>
          </div>
        </div>
      </div>

      <div class="data-card relation-card">
        <div class="relation-title">Unique data (deduplicated records)</div>
        <div class="relation-body">
          <div class="metric-box">
            <span class="card-label">Number of listings (ID)</span>
            <span class="card-value id-color">1,022</span>
          </div>
          <div class="link-arrow">
            <span class="arrow">➔</span>
          </div>
          <div class="metric-box">
            <span class="card-label">Number of tickets</span>
            <span class="card-value ticket-color">2,489</span>
          </div>
        </div>
      </div>
    </div>
    
    <br>How did these approximately 2,500 tickets change in price as the kickoff approached? Tracing the trajectory of the market recorded in the data.<br> The gaps in the graph indicate periods when data could not be collected.`,
    highlightIds: [],
    time: null,
    ticketCount: 0,
    layout: "fullscreen",
    bgImage: "/images/stubhub.jpg"
  },

  {
    text: `<div class="time-travel-text">Now, let's turn back the clock.</div>`,
    highlightIds: [],
    time: "2026-07-18T00:53:00", 
    ticketCount: 0,
    layout: "fullscreen-clock" 
  },

  {
    text: "With only 38 hours left until kickoff, 450 tickets are still listed for sale. The cheapest option is an upper-tier seat in the stadium, where players look very small. Still, the price is as high as $9,750.",
    time: "2026-07-18T00:53:00",
    ticketCount: 450,
    highlightIds: [13388518861], 
    showSeatView: true,
    overlayPosition: "right"
  },

  {
    text: `Let's shift our focus to the pitch level.The price for this seat, where you can see the players up close, is $68,835. This is the most expensive ticket in the data I collected.`,
    highlightIds: [13369997536], 
    time: "2026-07-18T02:04:00", 
    ticketCount: 469,
    showSeatView: true,
    overlayPosition: "right"
  },

  {
    text: `Priced at $61,952, this seat is in the "Spain Supporters Value Tier." It is striking how prices have been inflated to this level for seats meant for true football fans who cheer until they lose their voice.`,
    highlightIds: [13382694909], 
    time: "2026-07-18T05:07:00",
    ticketCount: 448,
    graphImage: "/images/spain.jpg"
  },

  {
    text: `Just past noon on the day before kickoff, tickets in upper-deck Section 346 have remained listed at $18,091 for 28 days. A seller's expectation that a buyer will bite, however, is not so easily fulfilled.`,
    highlightIds: [13081692481], 
    time: "2026-07-18T13:14:00", 
    ticketCount: 485,
    showSeatView: true,
    overlayPosition: "right"
  },

  {
    text: `With 19 hours until kickoff, the price for the "Spain Supporters Value Tier" dropped to $44,055. For sellers, as time ticks away, the risk of going unsold only grows.`,
    highlightIds: [13382694909], 
    time: "2026-07-18T19:44:00", 
    ticketCount: 467 
  },

  {
    text: `Showing the fear of not selling, one seller initially listed a premium "FIFA Pavilion" seat for a very high price of $59,569. But as midnight got closer, the nervous seller dropped the price drastically all at once. The new price was just $15,164, a huge drop of 75 percent, reducing the price by $44,405 in a single move.`,
    highlightIds: [13343972990], 
    time: "2026-07-18T22:47:00", 
    ticketCount: 426 
  },

  {
    text: `By the morning of kickoff, even as prices continued to fall overall, one ticket in the club seats in the middle tier (Section 205A) jumped from $12,322 the previous evening to $34,527, reflecting a seller's gamble on last minute demand.`,
    highlightIds: [13390440615], 
    time: "2026-07-18T23:48:00", 
    ticketCount: 458
  },

  {
    text: `At 7:56 a.m. on July 19, with just seven hours remaining until kickoff, the price of a Spain supporters ticket, which had reached a staggering $68,835 during the massive surge, was drastically reduced to $23,349, presumably because the seller realized there were no buyers left. While it is impossible to know whether the ticket was ultimately sold or the listing was removed, this was the last time it could be tracked.`,
    highlightIds: [13382694909],
    time: "2026-07-19T07:56:00", 
    ticketCount: 451
  },

  {
    text: `This was the final data captured. With less than three hours until kickoff, 215 tickets were still lingering on the resale market. Even the ticket that had been left sitting in limbo for 28 days remained here, ultimately unsold.`,
    highlightIds: [13081692481], 
    time: "2026-07-19T12:02:00", 
    ticketCount: 215 
  },

  {
    title: "THE VERTICAL JUMP",
    text: `Here's a comparison between the 2026 final and previous World Cup tournaments.<br><br>
    According to The World Cup Guide, since 1998, the face value of the most expensive tickets (Category 1) for the final has risen gradually. Over a 24 year period from 1998 to 2022, prices increased fourfold. In contrast, the 2026 tournament saw a 5.4 fold increase in just 4 years. This clearly demonstrates how unprecedented the 2026 tournament was.`,
    highlightIds: [], 
    surgeSections: [],
    vanishSections: [],
    sectionChanges: {},
    time: null, 
    showSeatView: false,      
    overlayPosition: "center",
    layout: "fullscreen",
  },

  {
    text: `Now, let's examine the collected data in detail. First is the price distribution.
The most common price range was between $10,000 and $20,000, where two-thirds of the tickets were concentrated. Looking at the higher end, 5 percent of the tickets exceeded $30,000.`,
    highlightIds: [], 
    time: null, 
    ticketCount: 0,
    layout: "distribution-chart" 
  },

  {
    text: `Next, let's look at the seating locations of the listed tickets.
On the map, the darker the red, the greater the number of listings. Sections that glow in deeper shades indicate an overwhelming volume of tickets circulating in the market.
You will likely notice that the "Lower" sections, closest to the field, appear relatively dark.`,
    showSeatView: true,      
    overlayPosition: "center",
    layout: "stadium-map"
  },

  {
    layout: "sankey-chart", 
    text: `This chart examines the relationship between seating tiers, Upper (the farthest from the field), Middle, and Lower (the closest), and ticket prices. In terms of listing volume, the Lower tier had the most listings with 947 tickets, followed by the Upper tier with 860 and the Middle tier with 498. Overall, the closer the seat was to the field, the higher the price tended to be. However, the relationship was not absolute. Some Lower tier seats were listed for less than $10,000, while some Upper tier seats were priced at more than $20,000.`,
    highlightIds: [], 
    time: null,
    surgeSections: [],
    vanishSections: [],
    sectionChanges: {}
  }, 

  
  {
    text: `What level of liquidity did the listed tickets have? This graph places all IDs on the left and shows the timing of when they appeared and disappeared. The black area in the upper right indicates tickets that once existed but vanished. With only a short time remaining until kickoff, you can see a high level of liquidity as tickets were continuously listed and then removed.`,
    highlightIds: [], 
    time: null, 
    ticketCount: 0,
    layout: "waterfall-image" 
  },
  
  {
    text: "When looking at the number of tickets by time period, they generally fluctuated between 400 and 500 tickets. However, when focusing on the morning before the match, unnatural movements become apparent. Dramatic increases and decreases of as many as 200 tickets per hour were repeated.",
    iframeUrl: "https://datawrapper.dwcdn.net/NtA6l/1/?dark=true", 
    highlightIds: [], 
    time: null,
    surgeSections: [],
    vanishSections: [],
    sectionChanges: {},
    ticketCount: 0
  },
  
  
  {
    text: "What happened during these four hours? Let's trace it chronologically. At 8 a.m. on the day before kickoff. This is where the wild fluctuations began.",
    time: "2026-07-18T08:09:00",
    ticketCount: 462,
    showSeatView: true,
    showWaterfall: true,        
    waterfallPhase: 'step1',    
    overlayPosition: "split",   
    surgeSections: [],
    vanishSections: [],
    phantomMode: true
  },
  {
    text: "At 9 a.m., more than 160 tickets suddenly appeared on the market all at once. The red sections on the seating map show locations where at least 10 more tickets were listed compared to one hour earlier. Section 327 in the top right of the map saw an increase of 40 tickets.",
    time: "2026-07-18T09:11:00",
    ticketCount: 625,
    showSeatView: true,
    showWaterfall: true,
    waterfallPhase: 'step2',    
    overlayPosition: "split",
    surgeSections: ["327", "126", "124", "204", "109", "227A", "205A", "225A", "301", "108"],
    vanishSections: [],
    phantomMode: true
  },
  {
    text: "However, just one hour later, most of the tickets that had suddenly appeared disappeared. Blue sections indicate areas where at least 10 fewer tickets were listed compared to one hour earlier.",
    time: "2026-07-18T10:11:00",
    ticketCount: 412,
    showSeatView: true,
    showWaterfall: true,
    waterfallPhase: 'step3',    
    overlayPosition: "split",
    surgeSections: [],
    vanishSections: ["327", "126", "124", "204", "109", "227A", "205A", "225A", "301", "108"],
    phantomMode: true
  },
  {
    text: "An hour later, the tickets that had just disappeared reappeared. However, they were not exactly the same. Section 322 in the upper right saw an increase of 21 tickets. This was a movement not seen two hours earlier.",
    time: "2026-07-18T11:12:00",
    ticketCount: 631,
    showSeatView: true,
    showWaterfall: true,
    waterfallPhase: 'step4',    
    overlayPosition: "split",
    surgeSections: ["124", "327", "126", "204", "227A", "225A", "322", "109", "108", "301"],
    vanishSections: [],
    phantomMode: true
  },
  {
    text: "And at noon, they disappeared en masse once again.",
    time: "2026-07-18T12:13:00",
    ticketCount: 420,
    showSeatView: true,
    showWaterfall: true,
    waterfallPhase: 'step5',    
    overlayPosition: "split",
    surgeSections: [],
    vanishSections: ["124", "327", "126", "204", "227A", "225A", "322", "109", "108", "301"],
    phantomMode: true
  }, 
];  

export const phantomSteps = [
  { 
    timeLabel: "08:09", 
    totalTickets: 462, 
    status: "QUIET", 
    surgeSections: [], 
    vanishSections: [] 
  },
  { 
    timeLabel: "09:11", 
    totalTickets: 625, 
    status: "SURGE", 
    surgeSections: ["327", "126", "124", "204", "109", "227A", "205A", "225A", "301", "108"], 
    vanishSections: [] 
  },
  { 
    timeLabel: "10:11", 
    totalTickets: 412, 
    status: "VANISHED", 
    surgeSections: [], 
    vanishSections: ["327", "126", "124", "204", "109", "227A", "205A", "225A", "301", "108"] 
  },
  { 
    timeLabel: "11:12", 
    totalTickets: 631, 
    status: "SURGE", 
    surgeSections: ["124", "327", "126", "204", "227A", "225A", "322", "109", "108", "301"], 
    vanishSections: [] 
  },
  { 
    timeLabel: "12:13", 
    totalTickets: 420, 
    status: "VANISHED", 
    surgeSections: [], 
    vanishSections: ["124", "327", "126", "204", "227A", "225A", "322", "109", "108", "301"] 
  }

];
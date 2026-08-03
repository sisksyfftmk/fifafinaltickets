# THE OTHER FRENZY
## What Happened in the Ticket Resale Market Ahead of the World Cup Final

This project explores what happened in the ticket resale market right before the 2026 World Cup final in New York (New Jersey), using hourly data gathered from a major resale platform starting about 38 hours before kickoff. 

With dynamic pricing implemented on an unprecedented scale, the resale market turned into a financial game. This project tracks the market's liquidity, sudden price swings, and the mechanism behind the sudden appearance and disappearance of tickets (phantom inventory) right before the match, combining the collected data with an interactive scrollytelling web application.

## Repository Structure

* `story_steps.js`: Configuration file managing the text, timestamps, highlighted ticket IDs, and chart transitions for each scrollytelling step.
* `+page.svelte`: Main web application code built with SvelteKit, combining D3.js, Datawrapper, and custom components into a scroll-driven UI.
* `ticket_monitor.py`: Script used to fetch the data.
* `fifafinal.ipynb`: Jupyter notebook documenting the data analysis process using Python.
* `all_tickets.csv`: Dataset containing all collected ticket records.
* `components/`: Folder containing UI components such as seat views, stadium heatmaps, OpeningClock, price distribution, and Sankey charts.
* `data/`: Stores raw data and aggregated datasets used throughout the analysis.

## Data Collection & Analysis Process

1. **Hourly Ticket Data Collection**
   Gathered ticket listings from the resale platform every hour, starting approximately 38 hours before kickoff until just before the match. This built a cumulative dataset of 5,017 listings (11,875 tickets) and a deduplicated unique dataset of 1,022 listings (2,489 tickets).

2. **Data Cleaning and Structuring**
   Used Python (Pandas) to merge time-series data and handle missing values, tracking price changes and listing/removal timing for each ticket.

3. **Interactive Visualization **
   Built a scrollytelling interface that links user scrolling to real-time "time travel" and stadium seat price fluctuations, going beyond static analysis.

## Growth & Skills Acquired

* **Complex Frontend Development (SvelteKit)**: Built an interactive UI that dynamically updates dashboards, timestamps, seat views, and heatmaps based on scroll position (Intersection Observer).
* **Web Data Storytelling**: Transformed raw data into an immersive web app that lets readers experience the market frenzy leading up to kickoff.

## Future Steps

While this iteration focused primarily on price analysis, the dataset contains numerous columns that have yet to be fully explored. I hope to continue uncovering new stories hidden within this data.

## Link to the Story

The complete data visualization and data-driven story can be viewed live on GitHub Pages:
https://sisksyfftmk.github.io/fifafinaltickets/

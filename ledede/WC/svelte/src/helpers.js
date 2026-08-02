import * as d3 from 'd3';
export function processTicketData(rawData) {
    const cleanData = rawData.map(d => {
    return {
      id: d.id,
      time: new Date(d.scraped_time), 
      price: +d.rawPrice,             
      section: d.section,
      ticketClass: d.ticketClassName
    };
  });

  const groupedData = d3.group(cleanData, d => d.id);
  return {
    allPoints: cleanData,     
    groupedLines: groupedData 
  };
}
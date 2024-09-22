// Set dimensions for the SVG container
const width = 900;
const height = 400;
const margin = { top: 20, right: 30, bottom: 40, left: 40 };


// Create an SVG container
const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Add a title to the chart
svg.append("text")
  .attr("id", "title")
  .attr("x", width / 2)
  .attr("y", margin.top)
  .attr("text-anchor", "middle")
  .text("GDP Bar Chart");

// Create tooltip element
const tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden") // Initially hidden
  .style("background", "lightgray")
  .style("padding", "5px")
  .style("border-radius", "5px")
  .style("pointer-events", "none") // Avoid blocking mouse events
  .style("z-index", "1000"); // Ensure it's on top

// Fetch the GDP data
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(response => response.json())
  .then(data => {
    const gdpData = data.data;

    // Parse the date
    const parseData = d3.timeParse("%Y-%m-%d");
    gdpData.forEach(d => {
      d.date = parseData(d[0]);
      d.gdp = +d[1];
    });

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(gdpData, d => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(gdpData, d => d.gdp)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d3.timeFormat("%Y"));

    const yAxis = d3.axisLeft(yScale)
      .ticks(10);

    // Append axes to the SVG
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Create bars
    svg.selectAll("rect")
      .data(gdpData)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.date))
      .attr("y", d => yScale(d.gdp))
      .attr("width", (width - margin.left - margin.right) / gdpData.length - 1)
      .attr("height", d => height - margin.bottom - yScale(d.gdp))
      .attr("fill", "steelblue")
      .attr('data-date', d => d3.timeFormat('%Y-%m-%d')(d.date))
      .attr('data-gdp', d => d.gdp)
      .attr('class', 'bar')
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("fill", "orange"); // Change color on hover

        tooltip
          .style("visibility", "visible") // Make the tooltip visible
          .attr("data-date", d3.timeFormat('%Y-%m-%d')(d.date)) // Set data-date
          .html(`GDP: $${d.gdp.toLocaleString()}<br>Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}`)
          .style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", "steelblue"); // Reset color
          
        tooltip.style("visibility", "hidden"); // Hide the tooltip on mouseout
      });
  });

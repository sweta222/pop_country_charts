
d3.json('../../data/population.json').then(function(data) {
  //console.log(data)
  var years= [];
  var population_growth_rate = [];
  var pop_density = [];
  var country = [];
  var pop = [];
  var refData = data.map(d => {
      years.push(d.Year);
      population_growth_rate.push(Number(d.Population_Growth_Rate));
      pop_density.push(Number(d.Population_Density));
      country.push(d.Country);
      return {
        year: d.Year,
        popGrowthRate : Number(d.Population_Growth_Rate),
        country: d.Country,
        popDensity: Number(d.Population_Density),
        pop:d['Population (000s)']
      }
  });
  let filteredRefData = refData.filter(z => {return !Number.isNaN(z.popGrowthRate) && !Number.isNaN(z.popDensity) && !Number.isNaN(z.year) && !Number.isNaN(z.pop)});
  let sortedFilRefData = filteredRefData.sort((a, b) => a.year - b.popGrowthRate);
  let areaChartData = sortedFilRefData.map((d) => {return {year:d.year,popgrowthrate:d.popGrowthRate}});
  let convertedPopToNumEx = filteredRefData.map(d => {
    return {
      year: d.year,
      popGrowthRate : d.popGrowthRate,
      country: d.country,
      popDensity: d.popDensity,
      pop: Number(d.pop)
  }});
  let filteredConvertedPopToNumEx = convertedPopToNumEx.filter(z => {
    return !Number.isNaN(z.pop)});
  //console.log(filteredConvertedPopToNumEx)
  let popDataArray = filteredConvertedPopToNumEx.map(z => z.pop);
  let popData = popDataArray.reduce((a,b) => {return a+b});
  //console.log(popData)
  let totalCountry = country.filter((item,index) => {return country.indexOf(item) === index});
  //console.log(totalCountry) -237
  let defaultYearVal = Math.max(...years);
  var dropdown = d3.select("#dropdown");
  dropdown.selectAll("option")
  .data(years)
  .enter().append("option")
  .attr("value", function(d) { return d; })
  .text(function(d) { return d });
  dropdown.property("value", defaultYearVal);
 // Update the dropdown text when a new value is selected
 dropdown.on("change", function() {
    var selectedValue = d3.select(this).property("value");
    dropdown.property("value", selectedValue);
    if(selectedValue){
      //drawLineChart("#line-chart",selectedValue);
      //drawScatterChart("#scatter-chart",selectedValue);
      console.log(`${selectedValue}`+ " "+ "is selected");
    }
    else{
      console.log("You haven't selected any year");
    }
  });

  const drawLineChart = (selectorLineId,yearVal) => {
    var margin = {top: 40, right: 40, bottom: 40, left: 60},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    svg = d3.select(selectorLineId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", `translate(${margin.left},${margin.top})`),
    g = svg.append("g");
    d3.select("#heading").append("text").text("World Population Data" + "(" + defaultYearVal + ")");
    d3.select("#pop-data").append("text").text(popData)
    var xScale = d3.scaleLinear().domain(d3.extent(areaChartData,(d) => {return d.year})).range([0,width]);
    var yScale = d3.scaleLinear().domain([0, d3.max(areaChartData, (d) => {return d.popgrowthrate})]).range([height,0])
    var xAxis = d3.axisBottom(xScale)
    var yAxis = d3.axisLeft(yScale).ticks(10);
    var area = d3.area().curve(d3.curveBasis).x((d) => {//console.log(d.year);
      return [xScale(d.year)]}).y0(yScale(0)).y1((d) => {//console.log(d.popgrowthrate);
        return [yScale(d.popgrowthrate)]});
    g.append("g").call(xAxis).attr("class","x axis").attr("transform","translate(0," + height + ")");
    g.append("g").call(yAxis).attr("class","y axis").append("text").attr("transform","rotate(-90)");
    g.append("g").append("path").attr("class","area").attr("d",area(areaChartData)).attr("fill","orange");
}

const drawScatterChart = (selectorScatterId,yearVal) => {
  var margin = {top: 10, right: 40, bottom: 40, left: 100}
  var width = 1000,
  height = 350,
  svg = d3.select(selectorScatterId).append("svg").attr("width",width + margin.left + margin.right).attr("height",height + margin.top + margin.bottom).append("g").attr("transform", `translate(${margin.left},${margin.top})`),
  g = svg.append("g"),
  tooltip = d3.select('body').append('div').attr('class', 'tip').style('opacity', 0),
  xScale = d3.scaleLinear().domain([d3.min(filteredConvertedPopToNumEx,(d) => {return d.popDensity}),d3.max(filteredConvertedPopToNumEx,(d) => {return d.popDensity})]).range([0,width]),
  yScale = d3.scaleLinear().domain([d3.min(filteredConvertedPopToNumEx,(d) => {return d.popGrowthRate}),d3.max(filteredRefData,(d) => {return d.popGrowthRate})]).range([height,0]),
  xAxis = d3.axisBottom(xScale),
  yAxis = d3.axisLeft(yScale),
  myColor = d3.scaleOrdinal().domain(totalCountry).range(d3.schemeSet3);
  g.append("g").call(xAxis).attr("transform","translate(0," + height + ")");
  g.append("g").call(yAxis).append("text").attr("transform","rotate(-90)");
  svg.append("text").attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")").style("text-anchor", "middle").text("Density");
  svg.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x",0 - (height / 2)).attr("dy", "1em").style("text-anchor", "middle").text("Population Growth Rate");
  var dots = g.append("g").selectAll("circle").data(filteredConvertedPopToNumEx);
  var rScale = d3.scaleLinear().domain([0, d3.max(filteredConvertedPopToNumEx, function(d) { return d.pop; })]).range([0, 20]);
  dots.enter().append("circle").attr("cx",(d) => {return [xScale(d.popDensity)]}).attr("cy",(d) => {return [yScale(d.popGrowthRate)]}).attr("r",(d) => {return rScale(d.pop)}).style("fill",(d) => {return myColor(d)}).on("mouseover", (d, i) => {
    //console.log(i)
    //console.log(filteredConvertedPopToNumEx[0]['country'])
    tooltip.transition().duration(400).style('opacity', 2)
    tooltip.html('Country : ' + i.country + '<br/>' + 'Year :' + i.year + '<br/>' + 'Population :' + i.pop + '<br/>' + 'Population Density :' + i.popDensity + '<br/>' + 'Population Growth Rate: ' + i.popGrowthRate + '<br/>')
  }).on("mouseout", (d, i) => {
    tooltip.transition().style('opacity', 0);
  })
  
}
   drawLineChart("#line-chart",defaultYearVal);
   drawScatterChart("#scatter-chart",defaultYearVal);
}).catch(er => console.log(er))


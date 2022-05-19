class LineChart {
    constructor(){        
        // this.apiData = [];       
    }  

    d3(confirmed_daily, state, target_div) {  
        let confirmed_daily_case = {};
        let dailyComfirmed = [];
        
        Object.keys(confirmed_daily[state]).forEach(ele=>{
             confirmed_daily_case["date"] = ele;
             confirmed_daily_case["confirmed_daily"] = confirmed_daily[state][ele];
             dailyComfirmed.push(confirmed_daily_case);
             confirmed_daily_case = {};
        })

         let dataset1 = dailyComfirmed ;
         var formatTime = d3.timeFormat("%Y-%m-%d");
         
         dataset1.forEach(function(d) {
             d.date = new Date(formatTime(new Date(d.date)));            
             d.confirmed_daily = (d.confirmed_daily > 0 ) ? d.confirmed_daily : 0;
         });
         

         const chartWidth = 190;
         const chartHeight = 80;

     
        
         d3.select(target_div).selectAll('svg').remove();

         let tipSVG = d3.select(target_div)
             .append("svg")
             .attr("width", chartWidth+70)
             .attr("height", chartHeight+60);

         

         let xScale = d3.scaleTime().domain([dataset1[0].date, dataset1[dataset1.length-1].date])
                     .range([0, chartWidth]);
         let yScale = d3.scaleLinear().domain([0, d3.max(dataset1, function(d) { return d.confirmed_daily; })]).range([chartHeight, 0]);
        
         let g = tipSVG.append("g")
         .attr("transform", "translate(" + 50 + "," + 100 + ")");

         tipSVG.append('text')
             .attr('x', chartWidth/2 + 100)
             .attr('y', 135)
             .attr('text-anchor', 'middle')
             .style('font-family', 'Helvetica')
             .style('font-size', 12)
             .text('daily comfimed cases');

         
         g.append("g")
            .attr("transform", "translate(0," + -19 + ")")                      
             .call( d3.axisBottom()
             .scale(xScale).ticks(6).tickFormat(d3.timeFormat("%Y-%m-%d")))
             .selectAll("text")	
               .style("text-anchor", "end")
               .attr("dx", "-.8em")
               .attr("dy", ".15em")
               .attr("transform", "rotate(-28)")
             ;
         
         
         g.append("g")
             .attr("transform", "translate(" + 0 + "," + -100 + ")")
             .call( d3.axisLeft()
             .scale(yScale)
             .ticks(3)
             );

        
         let line = d3.line()
             .x(function(d) {  
                 // console.log(d.date);            
                 return xScale(d.date); }) 
             .y(function(d) {                         
                 return yScale(d.confirmed_daily); }) 
             
         tipSVG.append("path")
             .datum(dataset1) 
             .attr("class", "line") 
             .attr("transform", "translate(" + 50 + "," + 0 + ")")
             .attr("d", line)
             .style("fill", "none")
             .style("stroke", "#2584ff")
             .style("stroke-width", "2");
       
    }  
    
}

export default LineChart;
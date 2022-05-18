import Fetch from "./fetch"

const stateURL = "src/json/usa.json"; 
const vaccinatedUrl ="https://data.cdc.gov/resource/unsk-b7fc.json";

let date = new Date();
const year = date.getFullYear();
const month = (((date.getMonth()+1) < 10 ? `0` : ``) + (date.getMonth()+1));
const day = date.getDate()-1;
const currentDate= year + `-` + month + `-` +  day;
const maxDate= year + `-` + month + `-` +  (date.getDate());
const updateCaseDate = year + `-` + month + `-` +  (date.getDate()-1);

date.setDate(date.getDate() - 7);
let weekage = date.getFullYear() + `-` + (((date.getMonth()+1) < 10 ? `0` : ``) + (date.getMonth()+1)) + `-` +  date.getDate();

const dailyComfirmedUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${weekage}T00:00:00.000Z&max_date=${maxDate}T00:00:00.000Z`;


class Map {
    constructor(ele){
        this.ele = ele;
        const d3drawMap = this.d3.bind(this.ele);
        d3drawMap();
    }  

    d3(){   
        // fetch api data
        const fetch = new Fetch();

        fetch.getData(stateURL).then(data => {                
             
            fetch.getData(vaccinatedUrl).then(vaccinatedata => {           
                d3.csv("src/csv/usa_state_abb.csv")
                .then((stateabbrdata, error)=>{                        
                    if(error){
                        console.log(error);
                    }else{                               
                        fetch.getData(dailyComfirmedUrl).then(dailyComfirmeddata => {                       
                           drawMap(data, vaccinatedata, stateabbrdata, dailyComfirmeddata);
                        });                           
                    }
                });
            });
       

        }); 

        
        // draw Map
        let drawMap = (data, vaccinatedata, stateabbrdata, dailyComfirmeddata)=> {
            // topo json covert to geo json
            const statesData = topojson.feature(data, data.objects.units).features;

            const width = 1150;
            const height = 600;
        
            let svg = d3.select(".canvaMap").append('svg')
                        .attr('width', width)
                        .attr('height', height);

            let current_position=[0,0];
            // Initialize tooltip
            let tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-50, 150])
                        .html((EVENT,d)=> d);
                        // .html(
                        //     "<p>Opioid-involved deaths over time in</p>
                        //     <div id='tipDiv'></div>"
                        //     );

            // Invoke the tip in the context of your visualization
            svg.call(tip)

            let projection = d3.geoAlbersUsa()
                                .scale(1150) // mess with this if you want
                                .translate([width / 2, height / 2]);

        
            let path = d3.geoPath()
                         .projection(projection);

                         

            // color map state base on Total Doses Administered Reported              
            let fullyVaccinated = {};
            for (let i = 0; i < stateabbrdata.length; i++) {
            const stateName = stateabbrdata[i].State;
            const stateAbbr = stateabbrdata[i].Abbr;
            const stateVaccinated= vaccinatedata.filter(ele => ele.date.split('T')[0] === currentDate  && ele.location === stateAbbr);
                if(stateVaccinated.length !== 0){
                    fullyVaccinated[stateName] = stateVaccinated[0].dist_per_100k;
                }
            }

            let deathCase = {};
            let population = {};
            let comfrimCase = {};
            let confirmed_daily = {};
            let totalCases = 0;
            let totalDeaths = 0;
            let dailyCases = 0;
            let dailyDeaths = 0;
     
            // console.log(dailyComfirmeddata);
            dailyComfirmeddata.forEach(ele=>{  
                if (ele.date.split('T')[0] === updateCaseDate ){  
                    deathCase[ele.state] ||= 0;
                    population[ele.state] ||= 0;
                    comfrimCase[ele.state] ||= 0;                   
                    deathCase[ele.state] += (typeof ele.deaths === "undefined") ? 0 :  ele.deaths;  
                    population[ele.state] += (typeof ele.population === "undefined") ? 0 :  ele.population; 
                    comfrimCase[ele.state] += (typeof ele.confirmed === "undefined") ? 0 :  ele.confirmed;

                    totalCases +=  ele.confirmed;
                    totalDeaths +=  ele.deaths;
                    dailyCases +=  ele.confirmed_daily; 
                    dailyDeaths += ele.deaths_daily; 
                }  
                confirmed_daily[ele.state] ||= {}; 
                confirmed_daily[ele.state][ele.date.split('T')[0]] ||= 0;
                confirmed_daily[ele.state][ele.date.split('T')[0]] += (typeof ele.confirmed_daily === "undefined") ? 0 :  ele.confirmed_daily;
                                  
            })

            d3.select(".container__sidebar--info").append('text')                
                    // .attr('text-anchor', 'left')
                    .style('font-family', 'Helvetica')
                    .style('font-size', 12)
                    .html( `<h2> Cases </h2>
                            <div class="total"> ` + totalCases + `<span class="daily"> +` + dailyCases + `</span> </div>
                            <h2> Deaths </h2>
                            <div class="total"> ` + totalDeaths + `<span class="daily"> +` + dailyDeaths + `</span> </div>`)
                
            

            svg.selectAll('path')
                .data(statesData)
                .enter().append('path')
                .attr('class', 'states')
                .attr('d', path)      
                .attr('color', (d,i) => getColor(d.properties.name, fullyVaccinated[d.properties.name]))
                .attr('fill' , (d,i) => getColor(d.properties.name, fullyVaccinated[d.properties.name])) 
                .on('mouseout', tip.hide) 
                .on('mouseover', (event,d)=>{
                   
                    current_position =  d3.pointer(event);


                    let tipObject = `<div class='tipContext'><strong>` + d.properties.name + `</strong>`
                                     + `<br>Total Cases:  ` + comfrimCase[d.properties.name]
                                     + `<br>Total Deaths: ` +  deathCase[d.properties.name]
                                     + `<br>Total Doses Administered rate: ${fullyVaccinated[d.properties.name]} </div><br>` ;
                    tipObject += `<div id='tipDiv'></div>`;
                    tip.show(event, tipObject);


                   let confirmed_daily_case = {};
                   let dailyComfirmed = [];
                   
                   Object.keys(confirmed_daily[d.properties.name]).forEach(ele=>{
                        confirmed_daily_case["date"] = ele;
                        confirmed_daily_case["confirmed_daily"] = confirmed_daily[d.properties.name][ele];
                        dailyComfirmed.push(confirmed_daily_case);
                        confirmed_daily_case = {};
                   })

                    let dataset1 = dailyComfirmed ;
                    var formatTime = d3.timeFormat("%Y-%m-%d");
                    
                    dataset1.forEach(function(d) {
                        // const arr = d.date.split("-")
                        // arr[2] =  parseInt(arr[2]) + 1;
                        // const date = arr.join("-");
                        // console.log(date);
                        d.date = new Date(formatTime(new Date(d.date)));
                       
                        d.confirmed_daily = (d.confirmed_daily > 0 ) ? d.confirmed_daily : 0;
                    });
                    
  
                    const chartWidth = 250;
                    const chartHeight = 80;

                    let tipSVG = d3.select("#tipDiv")
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
                          .attr("transform", "rotate(-25)")
                        ;
                    
                    
                    g.append("g")
                        .attr("transform", "translate(" + 0 + "," + -100 + ")")
                        .call( d3.axisLeft()
                        .scale(yScale).ticks(2));

                   
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
                })                
                ; 

        };

        // //colorRange pattern 1
        let  colorRange = ['#e1f1ff', '#baddff', '#90c6ff', '#88b7fa', '#79b8bf',
        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b'];
       
        let getColor = (d, fullyVaccinatedNum) => {      
            //    return colorRange[Math.floor(fullyVaccinatedPercentage/10)];
                if(fullyVaccinatedNum <= 0 ){
                    return colorRange[0]
                }
                else if (fullyVaccinatedNum > 1 && fullyVaccinatedNum < 190000){
                    return colorRange[1]
                }
                else if (fullyVaccinatedNum > 190001 && fullyVaccinatedNum < 200000){
                    return colorRange[2]
                }
                else if (fullyVaccinatedNum > 200001 && fullyVaccinatedNum < 210000){
                    return colorRange[3]
                }
                else if (fullyVaccinatedNum > 210001 && fullyVaccinatedNum < 220000){
                    return colorRange[4]
                }
                else if (fullyVaccinatedNum > 220001 && fullyVaccinatedNum < 230000){
                    return colorRange[5]
                }
                else if (fullyVaccinatedNum > 230001 && fullyVaccinatedNum < 240000){
                    return colorRange[6]
                }
                else if (fullyVaccinatedNum > 240001 && fullyVaccinatedNum < 250000){
                    return colorRange[7]
                }
                else if (fullyVaccinatedNum > 250001 && fullyVaccinatedNum < 260000){
                    return colorRange[8]
                }
                else if (fullyVaccinatedNum > 260001){
                    return colorRange[9]
                }
            }

    }

}


export default Map;
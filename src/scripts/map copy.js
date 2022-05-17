import Fetch from "./fetch"

const d = new Date();
const startDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + (d.getDate()-2);
const endDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + d.getDate();
// const month = (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) ;
const queryDate = `min_date=` + startDate + `&max_date=` +endDate;

const apiUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${startDate}&max_date=${endDate}`;
const stateURL = "./src/json/usa.json"; 
const vaccinatedUrl ="https://data.cdc.gov/resource/8xkx-amqh.json";

const dailyComfirmedUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=2022-05-14T00:00:00.000Z&max_date=${endDate}T00:00:00.000Z`;
// console.log(dailyComfirmedUrl);


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
            // console.log(data);
            fetch.getData(apiUrl).then(coviddata => {
                // console.log(coviddata);                
                fetch.getData(vaccinatedUrl).then(vaccinatedata => {
                    // console.log(vaccinatedata);              
                    d3.csv("./src/csv/usa_state_abb.csv")
                    .then((stateabbrdata, error)=>{
                        
                        if(error){
                            console.log(error);
                        }else{ 
                              
                            fetch.getData(dailyComfirmedUrl).then(dailyComfirmeddata => {
                                // let dailyComfirmed =[]; 
                                // var formatTime = d3.timeFormat("%d-%b-%y");

                                // dailyComfirmeddata.forEach(ele=>{
                                //     let dailyComfirmedObj = {};
                                //     // dailyComfirmedObj["date"] = formatTime(new Date(ele.date));
                                //     // dailyComfirmedObj["confirmed_daily"] = parseInt(ele.confirmed_daily);
                                //      dailyComfirmedObj["date"] = ele.date;
                                //     dailyComfirmedObj["confirmed_daily"] = ele.confirmed_daily;
                                //     dailyComfirmed.push(dailyComfirmedObj);
                                   
                                // })
                                 //console.log(dailyComfirmed);
                                 drawMap(data, coviddata, vaccinatedata, stateabbrdata, dailyComfirmeddata);

                            });

                           
                        }
                    });
                });
            });

        }); 

        
        // draw Map
        let drawMap = (data, coviddata, vaccinatedata, stateabbrdata, dailyComfirmeddata)=> {
            // topo json covert to geo json
            const statesData = topojson.feature(data, data.objects.units).features;

            const width = 1150;
            const height = 550;
        
            let svg = d3.select(".canvaMap").append('svg')
                        .attr('width', width)
                        .attr('height', height);

            let current_position=[0,0];
            // Initialize tooltip
            let tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-50, 130])
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

            // color map state base on death percent           
            let deathsArr = {};
            let population = {};
            let deathPercentage = {};
            coviddata.forEach(ele=>{                               
                deathsArr[ele.state] ||= 0;
                population[ele.state] ||= 0;
                deathsArr[ele.state] += (typeof ele.deaths === "undefined") ? 0 :  ele.deaths;  
                population[ele.state] += (typeof ele.population === "undefined") ? 0 :  ele.population; 
            })
            
            for (const [key, value] of Object.entries(deathsArr)) {              
                deathPercentage[key] = Math.floor((value / population[key]) * 10000);
            }   

            // color map state base on fully vaccinated percent   
            let fullyVaccinated = {};
            let fullyVaccinatedPercentage = {};
            for (let i = 0; i < stateabbrdata.length; i++) {
                const stateName = stateabbrdata[i].State;
                const stateAbbr = stateabbrdata[i].Abbr;

                const stateCovid = coviddata.filter(ele => ele.state === stateName);
                const stateVaccinated= vaccinatedata.filter(ele => ele.recip_state === stateAbbr);

                // work on each county ==> populationNums and vaccinatedNums
                stateCovid.forEach(ele=>{ 
                    // console.log(ele.population); 
                    fullyVaccinated[ele.state] ||= 0;
                    const countyname = ele.county;                   
                    const population = (typeof ele.population === "undefined") ? 0 :  ele.population;

                    let vaccinatedNums = stateVaccinated.filter(ele => ele.recip_county.includes(countyname)).map(ele=> ele.completeness_pct)[0];                   
                    vaccinatedNums = (typeof vaccinatedNums === "undefined") ? 0 :  vaccinatedNums;                    
                    vaccinatedNums = Math.floor(parseInt(population) * (parseInt(vaccinatedNums)/100));

                    fullyVaccinated[ele.state] += vaccinatedNums;                   
                })

            }

            for (const [key, value] of Object.entries(fullyVaccinated)) {              
                fullyVaccinatedPercentage[key] = Math.floor(value / population[key] * 100);
            }   

        
            svg.selectAll('path')
                .data(statesData)
                .enter().append('path')
                .attr('class', 'states')
                .attr('d', path) 
                .on('mouseout', tip.hide) 
                .on('mouseover', (event,d)=>{

                    const stateName = d.properties.name;
                    const stateCovid = coviddata.filter(ele => ele.state === stateName);

                    let confirmed = 0;
                    let deaths =0 ;

                    stateCovid.forEach(ele=>{ 
                        deaths += ele.deaths;
                        confirmed += ele.confirmed;  
                    })
                    
                    let tipObject = `<div class='tipContext'><strong>` + d.properties.name +`</strong>`
                                        + `<br>Totally Cases:  ` + confirmed 
                                        + `<br>Totally Deaths: ` + deaths
                                        + `<br>People Fully Vaccinated: ${fullyVaccinatedPercentage[stateName]}% </div><br>` ;
                  
                    tipObject += `<div id='tipDiv'></div>`;
                
                   
                    current_position =  d3.pointer(event);
                    // console.log(current_position[0]);




                    tip.show(event, tipObject);



                    // console.log(dailyComfirmeddata);
                    // console.log("=======");

                    let dailyComfirmed = [];
                    let dailySataeComfirmedData = dailyComfirmeddata.filter(ele=> ele.state === stateName);
                    let current_day;
                    let dailyComfirmedObj = {};
                    let confirmed_daily;
                    let date;

                    dailySataeComfirmedData.forEach((ele, i)=>{ 
                    
                            if (i === 0){                                                                           
                                date = ele.date;
                                confirmed_daily = 0;
                                current_day = ele.date;
                            }
                            
                            if (current_day !== ele.date){
                                dailyComfirmedObj = {
                                    "date" : date,
                                    "confirmed_daily" :confirmed_daily
                                }
                                dailyComfirmed.push(dailyComfirmedObj);
                                let dailyComfirmedObj = {};
                                date = ele.date;
                                confirmed_daily= 0;
                                current_day = ele.date;
                                // console.log("not same date");
                            }
                            else{
                                // console.log("Same date");
                                if(ele.confirmed_daily > 0) confirmed_daily += ele.confirmed_daily;
                            }

                            if (i ===(dailySataeComfirmedData.length-1)){
                                dailyComfirmedObj = {
                                    "date" : date,
                                    "confirmed_daily" :confirmed_daily
                                }
                                dailyComfirmed.push(dailyComfirmedObj);
                            }                                             
                            
                    })  

                   

                    let dataset1 = dailyComfirmed;
                    var formatTime = d3.timeFormat("%Y-%m-%d");
                    dataset1.forEach(function(d) {
                        d.date = new Date(formatTime(new Date(d.date)));
                        d.confirmed_daily = d.confirmed_daily;
                    });
                    
                    // console.log(dataset1);

                    const chartWidth = 250;
                    const chartHeight = 80;

                    let tipSVG = d3.select("#tipDiv")
                        .append("svg")
                        .attr("width", chartWidth+70)
                        .attr("height", chartHeight+60);
                 
                    let xScale = d3.scaleTime().domain([dataset1[0].date, dataset1[dataset1.length - 1].date])
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
                .attr('fill' , (d,i) => getColor(d.properties.name, fullyVaccinatedPercentage[d.properties.name])); 
             


        };

        //colorRange pattern 1
        let  colorRange = ['#e1f1ff', '#baddff', '#90c6ff', '#88b7fa', '#79b8bf',
        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b'];

        let getColor = (d, fullyVaccinatedPercentage) => {      
           return colorRange[Math.floor(fullyVaccinatedPercentage/10)];
        }

    }

}


export default Map;
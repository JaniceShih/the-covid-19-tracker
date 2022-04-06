import Fetch from "./Fetch"

const d = new Date();
const startDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + (d.getDate()-2);
const endDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + d.getDate();
const queryDate = `min_date=` + startDate + `&max_date=` +endDate;

const apiUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${startDate}&max_date=${endDate}`;
const stateURL = "https://janiceshih.github.io/the-covid-19-tracker/src/json/usa.json"; 
const vaccinatedUrl ="https://data.cdc.gov/resource/8xkx-amqh.json";

// for New York
const dailyComfirmedUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?state=New%20York&county=New%20York&min_date=2019-12-1T00:00:00.000Z&max_date=${endDate}`;


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
                    d3.csv("/src/csv/usa_state_abb.csv")
                    .then((stateabbrdata, error)=>{
                        
                        if(error){
                            console.log(error);
                        }else{ 
                              
                            fetch.getData(dailyComfirmedUrl).then(dailyComfirmeddata => {
                                let dailyComfirmed =[]; 
                                var formatTime = d3.timeFormat("%d-%b-%y");

                                dailyComfirmeddata.forEach(ele=>{
                                    let dailyComfirmedObj = {};
                                    // dailyComfirmedObj["date"] = formatTime(new Date(ele.date));
                                    // dailyComfirmedObj["confirmed_daily"] = parseInt(ele.confirmed_daily);
                                     dailyComfirmedObj["date"] = ele.date;
                                    dailyComfirmedObj["confirmed_daily"] = ele.confirmed_daily;
                                    dailyComfirmed.push(dailyComfirmedObj);
                                   
                                })
                                 console.log(dailyComfirmed);
                                 drawMap(data, coviddata, vaccinatedata, stateabbrdata, dailyComfirmed);

                            });

                           
                        }
                    });
                });
            });

        }); 

        
        // draw Map
        let drawMap = (data, coviddata, vaccinatedata, stateabbrdata, dailyComfirmed)=> {
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
                        .offset(current_position[0] > 650 ? [-20, -120] : [20, 120])
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
                    
                    let tipObject = `<strong>` + d.properties.name +`</strong><br>`
                                        + ` Cases:  ` + confirmed 
                                        + ` Deaths: ` + deaths
                                        + `<br>People Fully Vaccinated: ${fullyVaccinatedPercentage[stateName]}% ` ;
                  
                    tipObject += `<div id='tipDiv'></div>`;
                
                   
                    current_position =  d3.pointer(event);
                    // console.log(current_position[0]);

                    tip.show(event, tipObject);


                    
                    // for line chart
                    // let dataset1 = [
                    //     [1,1], [12,20], [24,36],
                    //     [32, 50], [40, 70], [50, 100],
                    //     [55, 106], [65, 123], [73, 130],
                    //     [78, 134], [83, 136], [89, 138],
                    //     [100, 140]
                    // ];


                    let dataset1 = dailyComfirmed;
                    var formatTime = d3.timeFormat("%Y-%m-%d");
                    dataset1.forEach(function(d) {
                        d.date = new Date(formatTime(new Date(d.date)));
                        d.confirmed_daily = +d.confirmed_daily;
                    });
                    
                    console.log(dataset1[0].date);
                    console.log( dataset1[dataset1.length - 1].date);
                    // console.log(" ==== dailyComfirmed chart ====");
                    console.log(dataset1);

                    const chartWidth = 250;
                    const chartHeight = 80;

                    let tipSVG = d3.select("#tipDiv")
                        .append("svg")
                        .attr("width", chartWidth)
                        .attr("height", chartHeight);

                    // let xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);

                    //     var dates = [];
                    //     for (let obj of dataset1) {
                            
                    //     dates.push(obj[0]);
                        
                    // }

                    // console.log(dates);
                    // var xScale = d3.scaleTime().range([0, chartWidth])
                    //                  .domain([new Date("2020-01-22"), new Date("2022-04-05")])
                    let xScale = d3.scaleTime().domain([dataset1[0].date, dataset1[dataset1.length - 1].date])
                                .range([0, chartWidth]);
                    let yScale = d3.scaleLinear().domain([0, d3.max(dataset1, function(d) { return d.confirmed_daily; })]).range([chartHeight, 0]);
                   
                    let g = tipSVG.append("g")
                    .attr("transform", "translate(" + 100 + "," + 100 + ")");

                    tipSVG.append('text')
                        .attr('x', 50)
                        .attr('y', 0)
                        .attr('text-anchor', 'middle')
                        .style('font-family', 'Helvetica')
                        .style('font-size', 10)
                        .text('daily comfimed cases');

                    g.append("g")
                    .attr("transform", "translate(0," + 80 + ")")
                    .call(d3.axisBottom(xScale));
                    
                    g.append("g")
                    .call(d3.axisLeft(yScale));

                   
                    let line = d3.line()
                    .x(function(d) {  
                        // console.log(d.date);  
                        // const dx= xScale(d.date);  
                        //  console.log(dx);                
                        return xScale(d.date); }) 
                    .y(function(d) {
                        // const dy= yScale(d.confirmed_daily);  
                        //  console.log(dy);                          
                        return yScale(d.confirmed_daily); }) 
                        
                    tipSVG.append("path")
                        .datum(dataset1) 
                        .attr("class", "line") 
                        // .attr("transform", "translate(" + 100 + "," + 100 + ")")
                        .attr("d", line)
                        .style("fill", "none")
                        .style("stroke", "#CC0000")
                        .style("stroke-width", "2");


                                            
                })                
                .attr('fill' , (d,i) => getColor(d.properties.name, fullyVaccinatedPercentage[d.properties.name])); 
             


        };

        //colorRange pattern 1
        let  colorRange = ['#e1f1ff', '#baddff', '#90c6ff', '#88b7fa', '#79b8bf',
        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b'];

        let getColor = (d, fullyVaccinatedPercentage) => {
           
            // console.log(`get color : ${d}  ${Math.floor(fullyVaccinatedPercentage/10)}`);
           return colorRange[Math.floor(fullyVaccinatedPercentage/10)];
        }

    }

}


export default Map;
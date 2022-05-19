import Fetch from "./fetch"
import LineChart from "./line_chart";

const stateURL = "src/json/usa.json"; 
const vaccinatedUrl ="https://data.cdc.gov/resource/unsk-b7fc.json";

let date = new Date();
const year = date.getFullYear();
const month = (((date.getMonth()+1) < 10 ? `0` : ``) + (date.getMonth()+1));
const day = date.getDate()-1;
const currentDate= year + `-` + month + `-` +  day;
const maxDate= year + `-` + month + `-` +  (date.getDate());
const updateCaseDate = year + `-` + month + `-` +  (date.getDate()-2);

date.setDate(date.getDate() - 7);
let weekage = date.getFullYear() + `-` + (((date.getMonth()+1) < 10 ? `0` : ``) + (date.getMonth()+1)) + `-` +  date.getDate();

const dailyComfirmedUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${weekage}T00:00:00.000Z&max_date=${maxDate}T00:00:00.000Z`;
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
       
            //   console.log(dailyComfirmeddata);
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



            let select = d3.select(".canvaChart__select").append("select")
                .attr("name", "name-list")
                .attr('class','select')
                .on("change", function () { 
                    const selectValue = d3.select('select').property('value')

                    d3.select(".canvaChart__header")                  
                            .html( `<div class='tipContext'>`
                                + `<span class="canvaChart__heading"> Doses Administered rate:</span> ${fullyVaccinated[selectValue]}<br>`
                                + `<span class="canvaChart__heading"> Cases:</span>  ` + comfrimCase[selectValue]
                                + `<br><span class="canvaChart__heading"> Deaths:</span> ` +  deathCase[selectValue] + `</div><br>` )
                    
                   
                    const linechart = new LineChart();
                    linechart.d3(confirmed_daily,  selectValue, '.canvaChart');
                    
                });

            let options = select.selectAll("option")
                .data(stateabbrdata)
                .enter()
                .append("option")
                 ;

            options.text(function(d) {               
                return d.State;
                })
                .attr("value", function(d) {
                return d.State;
                }) 
                ;

            const selectValue = d3.select('select').property('value')

            d3.select(".canvaChart__header")                  
                         .html( `<div class='tipContext'>`
                                + `<span class="canvaChart__heading"> Doses Administered rate:</span> ${fullyVaccinated[selectValue]}<br>`
                                + `<span class="canvaChart__heading"> Cases:</span>  ` + comfrimCase[selectValue]
                                + `<br><span class="canvaChart__heading"> Deaths:</span> ` +  deathCase[selectValue] + `</div><br>` )

            const linechart = new LineChart();
            linechart.d3(confirmed_daily,  'Alabama', '.canvaChart');

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


            d3.select(".container__sidebar--info").append('text')                
                    // .attr('text-anchor', 'left')
                    .style('font-family', 'Helvetica')
                    .style('font-size', 12)
                    .html( ` <div class="container__sidebar--header">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Flag_of_the_United_States_%28Pantone%29.svg/800px-Flag_of_the_United_States_%28Pantone%29.svg.png" width="30px" height="20">
                                <h1>United States</h1>
                            </div>
                            <h2> Cases </h2>
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

                    let tipObject = `<div class='tipContext'><p class="canvaChart__heading--primary">` + d.properties.name + `</p>`
                                     +`<span class="canvaChart__heading">Doses Administered rate:</span>: ${fullyVaccinated[d.properties.name]} <br>`
                                     + `<span class="canvaChart__heading">Cases:</span>  ` + comfrimCase[d.properties.name]
                                     + `<br><span class="canvaChart__heading">Deaths:</span> ` +  deathCase[d.properties.name]+` </div><br>` ;
                    tipObject += `<div id='tipDiv'></div>`;
                    tip.show(event, tipObject);
                    const linechart = new LineChart();
                    linechart.d3(confirmed_daily, d.properties.name, '#tipDiv');
                  
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
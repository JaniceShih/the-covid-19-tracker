import Fetch from "./Fetch"

const d = new Date();
const startDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + (d.getDate()-1);
const endDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + d.getDate();
const queryDate = `min_date=` + startDate + `&max_date=` +endDate;

const apiUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${startDate}&max_date=${endDate}`;

const stateURL = "/src/json/usa.json"; 
const vaccinatedUrl ="https://data.cdc.gov/resource/8xkx-amqh.json";


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
            console.log(data);
            fetch.getData(apiUrl).then(coviddata => {
                console.log(coviddata);
                
                fetch.getData(vaccinatedUrl).then(Vaccinatedata => {
                    console.log(Vaccinatedata);
                    drawMap(data, coviddata);
                });
            });

        }); 

        // draw Map
        let drawMap = (data, coviddata)=> {
            // topo json covert to geo json
            const statesData = topojson.feature(data, data.objects.units).features;

            const width = 1000;
            const height = 550;
        
            let svg = d3.select(".canvaMap").append('svg')
                        .attr('width', width)
                        .attr('height', height);

            // Initialize tooltip
            let tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-8, 0])
                        .html((EVENT,d)=> d);

            // Invoke the tip in the context of your visualization
            svg.call(tip)

            let projection = d3.geoAlbersUsa()
                                .scale(1000) // mess with this if you want
                                .translate([width / 2, height / 2]);

        
            let path = d3.geoPath()
                         .projection(projection);
                         
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

        
            svg.selectAll('path')
                .data(statesData)
                .enter().append('path')
                .attr('class', 'states')
                .attr('d', path)  
                .on('mouseover', (event,d)=>{

                    const stateNmae =d.properties.name;
                    const stateCovid = coviddata.filter(ele => ele.state === stateNmae);

                    let confirmed = 0;
                    let deaths =0 ;

                    stateCovid.forEach(ele=>{ 
                        deaths += ele.deaths;
                        confirmed += ele.confirmed;  
                    })
                    
                    const tipMessage = `<strong>` + d.properties.name +`</strong>`
                                        + `<br>Cases:  ` + confirmed 
                                        + `<br>Deaths: ` + deaths
                                        + ` (${deathPercentage[stateNmae]}%)` ;
                
                    tip.show(event, tipMessage);
                })
                .on('mouseout', tip.hide)
                .attr('fill' , function(d,i) {
                    // console.log(d.properties.name);
                    return getColor(d.properties.name, deathPercentage[d.properties.name]);
                }); 
             

            
        };

        //colorRange pattern 1
        let  colorRange = ['#e1f1ff', '#baddff', '#90c6ff', '#88b7fa', '#79b8bf',
        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b'];
        //colorRange pattern 2
        // var colorRange = ['#e1f1b9', '#c1e1b9', '#aad4ba', '#79b8bf',
        // '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b', '#f7fbce']
        //colorRange pattern 3
        // let  colorRange = ['#f7fbce', '#e1f1b9', '#c1e1b9', '#aad4ba', '#79b8bf',
        //                 '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b']

        let getColor = (d, deathPercentage) => {
           
            console.log(`get color : ${d}  ${Math.floor(deathPercentage/10)}`);
           return colorRange[Math.floor(deathPercentage/10)];
        }
    }

}


export default Map;
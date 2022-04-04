import Fetch from "./Fetch"

const d = new Date();
const startDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + (d.getDate()-1);
const endDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + d.getDate();
const queryDate = `min_date=` + startDate + `&max_date=` +endDate;

const apiUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${startDate}&max_date=${endDate}`;

const stateURL = "/src/json/usa.json"; 


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
                drawMap(data, coviddata);
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

            svg.selectAll('path')
                .data(statesData)
                .enter().append('path')
                .attr('class', 'states')
                .attr('d', path)  
                .on('mouseover', (event,d)=>{

                    const stateNmae =d.properties.name;
                    const stateCovid = coviddata.filter(ele => ele.state ===stateNmae);

                    let confirmed = 0;
                    let deaths =0 ;

                    stateCovid.forEach(ele=>{ 
                        deaths += ele.deaths;
                        confirmed += ele.confirmed;  
                    })
                    
                    const tipMessage = d.properties.name 
                                        + "<br>Cases: " + confirmed 
                                        + "<br>Deaths: " + deaths ;

                    tip.show(event, tipMessage);
                })
                .on('mouseout', tip.hide)
                .attr('fill' , '#b4b0be'); 
             

            
        };
    }

}


export default Map;
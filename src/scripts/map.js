class Map {
    constructor(ele){
        this.ele = ele;
        const d3drawMap = this.d3.bind(this.ele);
        d3drawMap();
    }  

    d3(){     
        
        const stateURL = "https://janiceshih.github.io/the-covid-19-tracker/src/json/usa.json";

        const covidURL ="https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?";
        const d = new Date();
        const startDate = d.getFullYear() + "-" + (((d.getMonth()+1) < 10 ? '0' : '') + (d.getMonth()+1)) + "-" + (d.getDate()-1);
        const endDate = d.getFullYear() + "-" + (((d.getMonth()+1) < 10 ? '0' : '') + (d.getMonth()+1)) + "-" + d.getDate();
        const querydate = "min_date=" + startDate + "&max_date=" +endDate;
        
        
        d3.json(stateURL)
        .then((data, error)=>{
            if(error){
                console.log(error);
            }else{    
                const query = covidURL + querydate;
                console.log(query);

                 d3.json(query)
                .then((coviddata, error)=>{
                    if(error){
                        console.log(error);
                    }else{                       
                        // coviddata.forEach(ele=>{                            
                        //     console.log(ele.confirmed_daily);
                        // })
                        
                        drawMap(data, coviddata);
                    }
                });

            }
        });


        let drawMap = (data, coviddata)=> {
            let statesData = topojson.feature(data, data.objects.units).features;

            let width = 800;
            let height = 550;

            let svg = d3.select(".canvaMap").append('svg')
                        .attr('width', width)
                        .attr('height', height);

            /* Initialize tooltip */
            let tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-8, 0])
                        .html((EVENT,d)=> d);

            /* Invoke the tip in the context of your visualization */
            svg.call(tip)

            let projection = d3.geoAlbersUsa()
                                .scale(800) // mess with this if you want
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
                        // console.log(ele.confirmed_daily);
                    })
                    const tipMessage = d.properties.name + "<br>Cases: " + confirmed + "<br>Deaths: " + deaths ;
                    tip.show(event, tipMessage);
                })
                .on('mouseout', tip.hide)
                .attr('fill' , '#e3e3e3'); 
            
        };
    }

}


export default Map;
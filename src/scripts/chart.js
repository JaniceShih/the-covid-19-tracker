import Fetch from "./Fetch"

const d = new Date();
const startDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + (d.getDate()-1);
const endDate = d.getFullYear() + `-` + (((d.getMonth()+1) < 10 ? `0` : ``) + (d.getMonth()+1)) + `-` + d.getDate();
const queryDate = `min_date=` + startDate + `&max_date=` +endDate;

const apiUrl = `https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?min_date=${startDate}&max_date=${endDate}`;

const stateAbb = "/src/csv/usa_sate_abb";

class Chart {    
    constructor(ele){
        this.ele = ele;
        const d3createcanva = this.d3.bind(this.ele);
        d3createcanva();   
    }  


    d3(){
         // fetch api data
         const fetch = new Fetch();
                   
        // console.log(data);
        fetch.getData(apiUrl).then(coviddata => {
            console.log(coviddata);
            d3Chart(coviddata);
        });       
  

        // d3 Chart
        let d3Chart = (coviddata)=> {
           
            const canvs = d3.select(".canvaChart");          
        
            // var dataArray = [4, 15, 34, 123,23];
            var dataArray = [
                {
                    width: 25, 
                    height: 4, 
                    fill: "pink"
                },
                {width: 25, height: 14, fill: "purple"},
                {width: 25, height: 44, fill: "orange"},
                {width: 25, height: 124, fill: "green"},
                {width: 25, height: 12, fill: "grey"}
            ]
    
    
            const svg = canvs.append('svg')
            .attr("width", 450)
            .attr("height", 450)
    
            
            const rect = svg.selectAll("rect");  
            
        
                rect.data(dataArray)
                .enter().append("rect")        
                .attr("width", 24)
                .attr("fill", d=> d.fill)
                .attr("height",  (d,i)=> d.height*2)
                .attr("x", (d,i)=>i*25) 
                .attr("y", (d,i)=> 300 - (d.height*2));
           
        };

    }

}


export default Chart;
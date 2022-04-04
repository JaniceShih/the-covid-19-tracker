import Fetch from "./Fetch"

const covidURL ='https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/us_only?';

const d = new Date();
const startDate = d.getFullYear() + '-' + (((d.getMonth()+1) < 10 ? '0' : '') + (d.getMonth()+1)) + '-' + (d.getDate()-1);
const endDate = d.getFullYear() + '-' + (((d.getMonth()+1) < 10 ? '0' : '') + (d.getMonth()+1)) + '-' + d.getDate();
const queryDate = 'min_date=' + startDate + '&max_date=' +endDate;

const apiUrl = covidURL + queryDate;

class Chart {    
    constructor(ele){
        this.ele = ele;
        // const fetch = new Fetch();
        // fetch.getApiData(apiUrl);

        const d3createcanva = this.d3.bind(this.ele);
        d3createcanva();
    }  

    d3(){
        const canvs = d3.select(".canvaChart");  
        
        d3.json(apiUrl)
        .then((data, error)=>{
            if(error){
                console.log(error);
            }else{                      
                console.log(data);
            }
        });

    }
}


export default Chart;
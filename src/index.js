// import Chart from "./scripts/Chart"
// import Fetch from "./scripts/Fetch"

import Map from "./scripts/Map"
import Lenged from "./scripts/Lenged"

document.addEventListener("DOMContentLoaded", () => {

    // Fetch data  
    // const main = document.getElementById("main"); 
    // const apiData = new Fetch(main);

    // D3 Chart
    // const canvaChart = document.getElementsByClassName("canvaChart")
    // new Chart(canvaChart);

     // D3 Lengend
     const legend = document.getElementsByClassName("legend"); 
     new Lenged(legend); 

     // D3 Map
     const canvaMap = document.getElementsByClassName("canvaMap"); 
     new Map(canvaMap);   
    

})

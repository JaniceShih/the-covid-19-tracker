// import Chart from "./scripts/Chart"
import Map from "./scripts/Map"
// import Fetch from "./scripts/Fetch"

document.addEventListener("DOMContentLoaded", () => {

   
    // Fetch data  
    // const main = document.getElementById("main"); 
    // new Fetch(main);

    // D3 Chart
    // const canvaChart = document.getElementsByClassName("canva")
    // new Chart(canvaChart);

     // D3 Map
     const canvaMap = document.getElementsByClassName("canvaMap"); 
     new Map(canvaMap);   
    

})

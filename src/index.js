// import Chart from "./scripts/Chart"
// import Fetch from "./scripts/Fetch"

import Map from "./scripts/map"
import Lenged from "./scripts/lenged"


document.addEventListener("DOMContentLoaded", () => {

     // Get the modal
     var modal = document.getElementById("myModal");

     // Get the button that opens the modal
     var btn = document.getElementById("myBtn");
 
     // Get the <span> element that closes the modal
     var span = document.getElementsByClassName("close")[0];
 
     // When the user clicks the button, open the modal 
     btn.onclick = function() {
          modal.style.display = "block";
     }
 
     // When the user clicks on <span> (x), close the modal
     span.onclick = function() {
          modal.style.display = "none";
     }
 
     // When the user clicks anywhere outside of the modal, close it
     window.onclick = function(event) {
          if (event.target == modal) {
               modal.style.display = "none";
          }
     }

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

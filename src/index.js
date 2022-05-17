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

         //Create the element using the createElement method.
         var myDiv = document.createElement("div");

         //Set its unique ID.
         myDiv.id = 'myDiv';
         myDiv.className = 'loading-text';
    
         //Add your content to the DIV
         myDiv.innerHTML = `
              <span class="loading-text-words">L</span>
              <span class="loading-text-words">O</span>
              <span class="loading-text-words">A</span>
              <span class="loading-text-words">D</span>
              <span class="loading-text-words">I</span>
              <span class="loading-text-words">N</span>
              <span class="loading-text-words">G...</span>
              `;
    
         //Finally, append the element to the HTML body
         document.body.appendChild(myDiv);
    
         document.getElementById('canvaMap').style.display = 'none';
         setTimeout(function () {
              document.getElementById('myDiv').style.display = 'none';
              document.getElementById('canvaMap').style.display = 'flex';
          }, 4000)
    

     // D3 Lengend
     const legend = document.getElementsByClassName("legend"); 
     new Lenged(legend); 

     // D3 Map
     const canvaMap = document.getElementsByClassName("canvaMap"); 
     new Map(canvaMap);   

     
    

})

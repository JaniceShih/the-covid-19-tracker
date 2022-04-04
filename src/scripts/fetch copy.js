class Fetch {
    constructor(ele){

        this.ele = ele
        // List:
        let div = document.createElement("div");
        div.setAttribute("id", "listApiData");
        div.innerText = "show State info";
        this.ele.appendChild(div);   

        
        getData();    
    }  
}


async function getData(url = 'https://api.covidtracking.com/v2/states.json') {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json() 
    return data
}

getData()
    .then(data => {
        show(data.data);        
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation: ', error);
    }
);

function show(data){

    var dataset = {};
    let dataName ="";
    for (let r of data) {
        dataName += `<p> State : ${r.name} : ${r.census.population} </p>`;
        dataset[r.name] = r.census.population;        
    }  
    document.getElementById("listApiData").innerHTML = dataName;
    // console.log(dataset);
    console.log("make a change");


}

export default Fetch;
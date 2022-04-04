class Fetch {
    constructor(){        
        this.apiData = [];
    }  

    // getApiData(apiUrl){
    //     getData(apiUrl);
    // }
}

// async function getData(apiUrl) {
//     console.log(apiUrl);
//     const response = await fetch(apiUrl);
//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }
//     const data = await response.json() 
//     return data
// }


// getData()
//     .then(data => {
//        console.log(data);       
//     })
//     .catch(error => {
//         console.error('There has been a problem with your fetch operation: ', error);
//     }
// );



export default Fetch;
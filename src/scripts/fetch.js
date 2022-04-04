class Fetch {
    constructor(){        
        // this.apiData = [];       
    }  

    async getData(apiUrl) {  
        const response = await fetch(apiUrl);       
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();    
     
        return data;
    }  
    
}

export default Fetch;
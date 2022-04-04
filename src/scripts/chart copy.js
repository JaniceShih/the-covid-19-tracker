class Chart {
    constructor(ele){
        this.ele = ele;
        const d3createcanva = this.d3.bind(this.ele);
        d3createcanva();
    }  

    d3(){
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
        
        // d3.json('https://jsonplaceholder.typicode.com/todos/1')
         d3.json('./src/scripts/text.json')
        .then(data=>{
            console.log(data);
            rect.data(data)
            .enter().append("rect")        
            .attr("width", 24)
            .attr("fill", d=> d.fill)
            .attr("height",  (d,i)=> d.height*2)
            .attr("x", (d,i)=>i*25) 
            .attr("y", (d,i)=> 300 - (d.height*2));
        });


            
    }

    // showd3(data){
    //     rect.data(data)
    //     .enter().append("rect")        
    //     .attr("width", 24)
    //     .attr("fill", d=> d.fill)
    //     .attr("height",  (d,i)=> d.height*2)
    //     .attr("x", (d,i)=>i*25) 
    //     .attr("y", (d,i)=> 100 - (d.height*2));
    // }
}


export default Chart;
class Lenged {
    constructor(ele){
        this.ele = ele;
        const d3Lenge = this.d3.bind(this.ele);
        d3Lenge();
    }  

    d3(){   
               
        const width = 600;
        const height = 80;
    
        let lenged = d3.select(".legend").append('svg')
                    .attr('width', width)
                    .attr('height', height);

               
        let  keys = ['10', '20', '30', '40', '50','60', '70', '80', '90'];       

        //colorRange pattern 1
        let  colorRange = ['#e1f1ff', '#baddff', '#90c6ff', '#88b7fa', '#79b8bf',
        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b'];
        //colorRange pattern 2
        // var colorRange = ['#e1f1b9', '#c1e1b9', '#aad4ba', '#79b8bf',
        // '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b', '#f7fbce']
        //colorRange pattern 3
        // let  colorRange = ['#f7fbce', '#e1f1b9', '#c1e1b9', '#aad4ba', '#79b8bf',
        //                 '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b']
        
        // let  color = d3.scaleOrdinal()
        //             .domain(keys)
        //             .range(colorRange);

        // Add one dot in the legend for each name.
        let  size = 40;
        lenged.selectAll('mylenged')
                .data(colorRange)
                .enter()
                .append('rect')                       
                .attr('y', 30)
                .attr('x', function(d,i){ return size + i*(size+2)})      
                .attr('width', 40)
                .attr('height', 15)
                .style('fill', function(d, i){ return colorRange[i]})

        // Add one dot in the legend for each name.
        lenged.selectAll('mylabels')
                .data(keys)
                .enter()
                .append('text')
                .attr('y', 20 + size)
                .attr('x', function(d,i){ return size*2 + i*(size+2)}) 
                .style('fill', 'darkgrey')
                .text(function(d, i){ return keys[i]})
                .attr('text-anchor', 'left')
                .style('alignment-baseline', 'middle')  

        lenged.append("text")
            .attr("x",size)
            .attr("y", 20)          
            .text("% People Death, 10000 as a percent");
    }

}


export default Lenged;
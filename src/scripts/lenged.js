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

               
        var keys = ['10', '20', '30', '40', '50','60', '70', '80', '90']
        var colorRange = ['#e1f1b9', '#c1e1b9', '#aad4ba', '#79b8bf',
                        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b', '#f7fbce']

        
        var color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(colorRange);

        // Add one dot in the legend for each name.
        var size = 40;
        lenged.selectAll('mylenged')
                .data(colorRange)
                .enter()
                .append('rect')                       
                .attr('y', 30)
                .attr('x', function(d,i){ return size+ i*(size+2)})      
                .attr('width', 40)
                .attr('height', 15)
                .style('fill', function(d){ return color(d)})

        // Add one dot in the legend for each name.
        lenged.selectAll('mylabels')
                .data(keys)
                .enter()
                .append('text')
                .attr('y', 20 + size)
                .attr('x', function(d,i){ return size*2 + i*(size+2)}) 
                .style('fill', 'darkgrey')
                .text(function(d){ return d})
                .attr('text-anchor', 'left')
                .style('alignment-baseline', 'middle')  

        lenged.append("text")
            .attr("x",size)
            .attr("y", 20)          
            .text("COVID-19 Stringency Index is from 0 to 100 (100 = strictest)");
    }

}


export default Lenged;
class Legend {
    constructor(ele){
        this.ele = ele;
        const d3Lenge = this.d3.bind(this.ele);
        d3Lenge();
    }  

    d3(){   
               
        const width = 750;
        const height = 80;
    
        let legend = d3.select(".legend").append('svg')
                    .attr('width', width)
                    .attr('height', height);

               
        let  keys = ['No Data','1', '190001', '200001', '210001', '220001', '230001','240001', '250001', '260001+'];       

        //colorRange pattern
        let  colorRange = ['#e1f1ff', '#baddff', '#90c6ff', '#88b7fa', '#79b8bf',
        '#5d99bc','#4c7ab1','#3a529b', '#2c3084', '#18205b'];

 
        let  size = 60;
        legend.selectAll('mylegend')
                .data(colorRange)
                .enter()
                .append('rect')                       
                .attr('y', 30)
                .attr('x', function(d,i){ return size + i*(size+2)})      
                .attr('width', 60)
                .attr('height', 15)
                .attr('class', 'legend')
                .attr('color',function(d, i){ return colorRange[i]})
                .attr('fill', function(d, i){ return colorRange[i]})
                .on("click", function (e) {     
                    
                    // const current = d3.select(this).style("color");
                  
                    // if(d3.select(this).style("fill") === current){
                    //     d3.select(this).attr('fill', '#9a98a3')
                    // }else{
                    //     d3.select(this).attr('fill', d3.select(this).style("color"))
                    // }               
                    

                    // d3.selectAll('path').each(function(){
                    //     if(current === d3.select(this).style("fill")){
                    
                    //         d3.select(this).attr('fill', '#9a98a3')
                    //     }else if(current === d3.select(this).style("color"))
                    //     {
                    //         d3.select(this).attr('fill', d3.select(this).style("color"))
                    //     }
                    // })

                    const currentlegend = d3.select(this).style("color");
                    
                    if(d3.select(this).style("fill") === currentlegend){
                        d3.select(this).attr('fill', '#9a98a3')
                    }else{
                        d3.select(this).attr('fill', d3.select(this).style("color"))
                    }               
                    const filllegend = d3.select(this).style("fill");

                    d3.selectAll('path').each(function(){
                        if(currentlegend === filllegend  &&  d3.select(this).style("color") === currentlegend ){
                            d3.select(this).attr('highlight', 'null')
                            d3.select(this).attr('fill', d3.select(this).style("color"))
                        }else if( d3.select(this).style("color") === currentlegend){
                            d3.select(this).attr('highlight', 'highlight')
                            d3.select(this).attr('fill', d3.select(this).style("color"))
                        }
                        if(d3.select(this).style("color")  !== currentlegend && d3.select(this).attr("highlight") ==='null' ){    
                            if(currentlegend === filllegend){
                                d3.select(this).attr('fill', d3.select(this).style("color"))
                            }else{
                                d3.select(this).attr('fill', '#9a98a3')
                            }                   
                           
                        }
                       
                       
                    })

                })

 
        legend.selectAll('mylabels')
                .data(keys)
                .enter()
                .append('text')
                .attr('y', size)
                .attr('x', function(d,i){ return size + i*(size+2)}) 
                .style('fill', '#5c5577')
                .text(function(d, i){ return keys[i]})
                .attr('text-anchor', 'left')
                .style('alignment-baseline', 'middle')  

        legend.append("text")
            .attr("x",size)
            .attr("y", 20)          
            // .text("% People Death, 10000 as a percent");
            .text("* Total Doses Administered rate (per 100,000 of the Total Population)");
           
    }

}


export default Legend;
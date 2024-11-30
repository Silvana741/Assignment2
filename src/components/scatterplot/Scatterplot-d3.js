import * as d3 from 'd3'
import { getDefaultFontSize } from '../../utils/helper';

class ScatterplotD3 {
    margin = {top: 20, right: 20, bottom: 70, left: 50};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    xScale = d3.scaleLinear();
    yScale = d3.scaleLinear();
    // colorScale = d3.scaleSequential(d3.interpolateBlues);

    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.matSvg=d3
            .select(this.el)
            .append("svg")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .append("g")
            .attr("class","scatterplotG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;

        this.xScale.range([0,this.width]);
        this.yScale.range([this.height,0]);

        // build xAxisG
        this.matSvg.append("g")
            .attr("class","x-axis")
            .attr("transform","translate(0,"+this.height+")")
        ;
        this.matSvg.append("g")
            .attr("class","y-axis")
        ;

        this.matSvg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", this.width/2)
            .attr("y", this.height +40)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Temperature");

        this.matSvg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -this.height/2)
            .attr("y", -50)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Bike Count");
            
    };


    updateFunction1(selection) {
        selection
            .attr("cx", (itemData) => this.xScale(itemData.x))
            .attr("cy", (itemData) => this.yScale(itemData.y))
            .attr("r", 5)
            // .attr("fill", (itemData) => this.colorScale(itemData.value));
    }

    renderScatterplot = function (visData, controllerMethods) {
        // Set up scales based on the data
        const xExtent = d3.extent(visData, (d) => d.x);
        const yExtent = d3.extent(visData, (d) => d.y);
        const valueExtent = d3.extent(visData, (d) => d.value);

        this.xScale.domain(xExtent).range([0, this.width]);
        this.yScale.domain(yExtent).range([this.height, 0]);
        // this.colorScale.domain(valueExtent);

        // Update axes
        const xAxis = d3.axisBottom(this.xScale).ticks(10);
        const yAxis = d3.axisLeft(this.yScale).ticks(10);

        this.matSvg.select(".x-axis").call(xAxis);
        this.matSvg.select(".y-axis").call(yAxis);

        // Bind data and render points
        this.matSvg.selectAll(".itemG")
            .data(visData, (itemData) => itemData.id) // Use a unique identifier
            .join(
                (enter) => {
                    const itemG = enter
                        .append("g")
                        .attr("class", "itemG")
                        .attr("fill", "steelblue")
                        .attr("opacity", 0.8)
                        .on("mouseover", (event, itemData) => {
                            controllerMethods.handleOnHover(itemData);
                        })
                        .on("click", (event, itemData) => {
                            controllerMethods.handleOnClick(itemData);
                        });

                    // Append circle elements
                    itemG
                        .append("circle")
                        .attr("class", "scatter-point")
                        .attr("fill", "steelblue");
                    this.updateFunction1(itemG.select("circle"));
                },
                (update) => {
                    this.updateFunction1(update.select("circle")); // Update existing points
                },
                (exit) => {
                    exit.remove(); // Remove points no longer in data
                }
            );

            const brush = d3.brush()
            .extent([
                [0,0],
                [this.width, this.height],
            ])
            .on("brush end", (event) => {
                if (event.selection) {
                    const [[x0, y0], [x1, y1]] = event.selection;
                    // Update point colors based on brush selection
                    this.matSvg
                        .selectAll(".scatter-point")
                        .attr("fill", (d) => {
                            const isBrushed =
                                this.xScale(d.x) >= x0 &&
                                this.xScale(d.x) <= x1 &&
                                this.yScale(d.y) >= y0 &&
                                this.yScale(d.y) <= y1;
                            return isBrushed ? "orange" : "steelblue"; // Brushed = orange, unbrushed = steelblue
                    });
                    const brushedData = visData.filter((d) =>
                    this.xScale(d.x) >= x0 &&
                    this.xScale(d.x) <= x1 &&
                    this.yScale(d.x) >= y0 &&
                    this.yScale(d.x) <= y1 
                );
                console.log(brushedData)
                controllerMethods.handleBrushed(brushedData);
                }
            });


            this.matSvg.append("g").attr("class", "brush").call(brush);
    };

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ScatterplotD3;
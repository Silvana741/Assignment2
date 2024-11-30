import * as d3 from "d3";

class MultiLineD3 {
    margin = { top: 20, right: 20, bottom: 70, left: 50 };
    size;
    height;
    width;
    matSvg;
    xScale = d3.scaleLinear();
    yScale = d3.scaleLinear();
    colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(["Spring", "Summer", "Fall", "Winter"])
            .range(d3.schemeCategory10);

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.matSvg = d3
            .select(this.el)
            .append("svg")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .append("g")
            .attr("class", "multilineG")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);

        this.matSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.height})`);

        this.matSvg.append("g").attr("class", "y-axis");

        this.matSvg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Hour");

        this.matSvg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -this.height / 2)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Rented Bike Count");
    };

    renderMultiLineChart = function (data, controllerMethods) {
        const groupedData = d3.group(data, (d) => d.season);

        this.xScale.domain([0, 23]);
        const yMax = d3.max(data, (d) => d.rentedBikeCount);
        this.yScale.domain([0, yMax]);

        const xAxis = d3.axisBottom(this.xScale).ticks(24);
        const yAxis = d3.axisLeft(this.yScale);

        this.matSvg.select(".x-axis").call(xAxis);
        this.matSvg.select(".y-axis").call(yAxis);

        const lineGenerator = d3
            .line()
            .x((d) => this.xScale(d.hour))
            .y((d) => this.yScale(d.rentedBikeCount));

        this.matSvg
            .selectAll(".line-path")
            .data(groupedData)
            .join(
                (enter) =>
                    enter
                        .append("path")
                        .attr("class", "line-path")
                        .attr("d", ([season, values]) => lineGenerator(values))
                        .attr("fill", "none")
                        .attr("stroke", ([season]) => this.colorScale(season))
                        .attr("stroke-width", 2),
                (update) =>
                    update.attr("d", ([season, values]) => lineGenerator(values))
                        .attr("stroke", ([season])=> this.colorScale(season)),
                (exit) => exit.remove()
            );
            
            const legend = this.matSvg
                .selectAll(".legend")
                .data(groupedData)
                .join("g")
                .attr("class", "legend")
                .attr("transform", (d,i)=> `translate(${i*100}, -10)`);
            legend
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", ([season])=> this.colorScale(season));
    
            legend
                .append("text")
                .attr("x", 20)
                .attr("y", 12)
                .style("font-size", "12px")
                .text(([season])=>season);

        const brush = d3
            .brushX()
            .extent([
                [0, 0],
                [this.width, this.height],
            ])
            .on("brush end", (event) => {
                if (event.selection) {
                    const [x0, x1] = event.selection.map(this.xScale.invert);
                    const brushedData = data.filter(
                        (d) => d.hour >= x0 && d.hour <= x1
                    );

                    controllerMethods.handleBrushed(brushedData);
                }
            });

        this.matSvg.append("g").attr("class", "brush").call(brush);
    };

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    };
}

export default MultiLineD3;

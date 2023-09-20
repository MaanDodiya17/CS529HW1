import React, { useEffect, useRef, useMemo } from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

//change the code below to modify the bottom plot view
export default function WhiteHatStats(props) {
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);
    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const margin = 50;
    const radius = 10;


    //TODO: modify or replace the code below to draw a more truthful or insightful representation of the dataset. This other representation could be a histogram, a stacked bar chart, etc.
    //this loop updates when the props.data changes or the window resizes
    //we can edit it to also use props.brushedState if you want to use linking
    useEffect(() => {
        //wait until the data loads
        if (svg === undefined | props.data === undefined) { return; }

        //aggregate gun deaths by state
        const data = props.data.states;
        console.log(data);
        //get data for each state
        // const plotData = [];
        // for (let state of data) {
        //     const dd = drawingDifficulty[state.abreviation];
        //     let entry = {
        //         'count': state.count,
        //         'name': state.state,
        //         'easeOfDrawing': dd === undefined ? 5 : dd,
        //         'genderRatio': state.male_count / state.count,
        //     };
        //     plotData.push(entry);
        // }
        // console.log(plotData);

        const plotData2 = [];
        for (let state of data) {
            let entry = {
                'abreviation': state.abreviation,
                'population': state.population,
                'gunDeathsPer1000000': Math.round((state.count / state.population) * 1000000),
                'maleDeathsPer1000000': Math.round((state.male_count / state.population) * 1000000),
                'femaleDeathsPer1000000': Math.round(((state.count - state.male_count) / state.population) * 1000000),
                'male_count': state.male_count,
                'female_count': state.count - state.male_count,
                'count': state.count,
                'name': state.state,
            };
            plotData2.push(entry);
        }
        console.log(plotData2);

        //get transforms for each value into x and y coordinates
        const xScale = d3
            .scaleBand()
            .domain(plotData2.map((d) => d.abreviation))
            .range([50, width - 1])
            .padding(0.25);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(plotData2, (d) => Math.max(d.maleDeathsPer1000000, d.femaleDeathsPer1000000))])
            .nice()
            .range([height - margin, margin]);


        svg.selectAll('.male')
            .data(plotData2)
            .enter()
            .append('rect')
            .attr('class', 'male')
            .attr('x', (d) => xScale(d.abreviation))
            .attr('y', (d) => yScale(d.maleDeathsPer1000000))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', (d) => height - margin - yScale(d.maleDeathsPer1000000))
            .attr('fill', '#253494')
            .on('mouseover', (e, d) => {
                const tooltipText = d.name + '</br>'
                    + 'Gun Deaths:' + d.count + '</br>'
                    + 'Population: ' + d.population + '</br>'
                    + "Male: " + d.male_count + '</br>'
                    + "Rate: " + d.maleDeathsPer1000000
                    + ' Deaths per 1,000,000 people';
                props.ToolTip.moveTTipEvent(tTip, e);
                tTip.html(tooltipText);
            })
            .on('mousemove', (e) => {
                props.ToolTip.moveTTipEvent(tTip, e);
            })
            .on('mouseout', () => {
                props.ToolTip.hideTTip(tTip);
            });


        svg.selectAll('female')
            .data(plotData2)
            .enter()
            .append('rect')
            .attr('class', 'female')
            .attr('x', (d) => xScale(d.abreviation) + xScale.bandwidth() / 2) // Second half of the bandwidth
            .attr('y', (d) => yScale(d.femaleDeathsPer1000000))
            .attr('width', xScale.bandwidth() / 2) // Half of the bandwidth
            .attr('height', (d) => height - margin - yScale(d.femaleDeathsPer1000000))
            .attr('fill', '#c51b8a')
            .on('mouseover', (e, d) => {
                const tooltipText = d.name + '</br>'
                    + 'Gun Deaths:' + d.count + '</br>'
                    + 'Population: ' + d.population + '</br>'
                    + "Female: " + d.female_count + '</br>'
                    + "Rate: " + d.femaleDeathsPer1000000
                    + ' Deaths per 1,000,000 people';
                props.ToolTip.moveTTipEvent(tTip, e);
                tTip.html(tooltipText);
            })
            .on('mousemove', (e) => {
                props.ToolTip.moveTTipEvent(tTip, e);
            })
            .on('mouseout', () => {
                props.ToolTip.hideTTip(tTip);
            });



        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin / 2)
            .attr('font-size', 20)
            .attr('font-weight', 'bold')
            .text('Gun Deaths per 1,000,000 Population by State (by Gender)')
            .attr('text-anchor', 'middle');

        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - 50})`)
            .call(d3.axisBottom(xScale))
            .attr('font-size', 8);

        svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(50,0)`)
            .call(d3.axisLeft(yScale));

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .text('Deaths per 1,000,000 Population');

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .text('States');

    }, [props.data, svg]);

    return (
        <div className={"d3-component"} style={{ 'height': '100%', 'width': '100%' }} ref={d3Container}></div>
    );
}
//END of TODO #1.

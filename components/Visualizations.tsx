import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Planet } from '../types';

interface ScatterPlotProps {
    data: Planet[];
    selectedPlanet: Planet | null;
    onPlanetClick?: (planet: Planet) => void;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, selectedPlanet, onPlanetClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 50, left: 60 };

        // Filter valid data for log scale
        const validData = data.filter(d => d.pl_orbper > 0 && d.pl_rade > 0);
        
        // Color scale based on discovery year
        const years = validData.map(d => parseInt(d.disc_year)).filter(y => !isNaN(y) && y > 0);
        const minYear = d3.min(years) || 2018;
        const maxYear = d3.max(years) || new Date().getFullYear();
        
        const colorScale = d3.scaleSequential()
            .domain([minYear, maxYear])
            .interpolator(d3.interpolateViridis);

        const xScale = d3.scaleLog()
            .domain([d3.min(validData, d => d.pl_orbper) || 0.1, d3.max(validData, d => d.pl_orbper) || 1000])
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLog()
            .domain([d3.min(validData, d => d.pl_rade) || 0.1, d3.max(validData, d => d.pl_rade) || 30])
            .range([height - margin.bottom, margin.top]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(5, "~s"))
            .call(g => g.append("text")
                .attr("x", width - margin.right)
                .attr("y", 40)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text("Orbital Period (days)"));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale).ticks(5, "~s"))
            .call(g => g.append("text")
                .attr("x", -margin.left)
                .attr("y", 15)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("Radius (Earth Radii)"));

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "absolute hidden bg-slate-800 text-white text-xs p-2 rounded border border-slate-600 pointer-events-none")
            .style("z-index", "50");

        // Points
        const circles = svg.append("g")
            .selectAll("circle")
            .data(validData)
            .join("circle")
            .attr("cx", d => xScale(d.pl_orbper))
            .attr("cy", d => yScale(d.pl_rade))
            .attr("r", d => d.pl_name === selectedPlanet?.pl_name ? 8 : 5)
            .attr("fill", d => {
                if (d.pl_name === selectedPlanet?.pl_name) return "#ffffff";
                const y = parseInt(d.disc_year);
                return !isNaN(y) ? colorScale(y) : "#475569";
            })
            .attr("opacity", d => d.pl_name === selectedPlanet?.pl_name ? 1 : 0.8)
            .attr("stroke", d => d.pl_name === selectedPlanet?.pl_name ? "#06b6d4" : "none")
            .attr("stroke-width", d => d.pl_name === selectedPlanet?.pl_name ? 3 : 0)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                if (onPlanetClick) onPlanetClick(d);
            })
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 2)
                    .attr("opacity", 1)
                    .attr("r", 8);
            })
            .on("mouseout", (event, d) => {
                if (d.pl_name !== selectedPlanet?.pl_name) {
                    d3.select(event.currentTarget)
                        .attr("stroke", "none")
                        .attr("stroke-width", 0)
                        .attr("opacity", 0.8)
                        .attr("r", 5);
                } else {
                     d3.select(event.currentTarget)
                        .attr("stroke", "#06b6d4")
                        .attr("stroke-width", 3)
                        .attr("fill", "#ffffff");
                }
            });

        circles.append("title")
            .text(d => `${d.pl_name}\nYear: ${d.disc_year}\nPeriod: ${d.pl_orbper} d\nRadius: ${d.pl_rade} Re`);
        
        // Add Color Legend
        const legendWidth = 200;
        const legendHeight = 10;
        const legendX = width - margin.right - legendWidth;
        const legendY = margin.top;

        // Gradient
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");
        
        const stopData = d3.ticks(minYear, maxYear, 10).map((t, i, n) => ({ 
            offset: `${(i / (n.length - 1)) * 100}%`, 
            color: colorScale(t) 
        }));

        linearGradient.selectAll("stop")
            .data(stopData)
            .enter().append("stop")
            .attr("offset", (d: any) => d.offset)
            .attr("stop-color", (d: any) => d.color);

        svg.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("x", legendX)
            .attr("y", legendY)
            .style("fill", "url(#linear-gradient)");

        svg.append("text")
            .attr("x", legendX)
            .attr("y", legendY + 20)
            .text(minYear)
            .attr("font-size", "10px")
            .attr("fill", "#94a3b8");

        svg.append("text")
            .attr("x", legendX + legendWidth)
            .attr("y", legendY + 20)
            .attr("text-anchor", "end")
            .text(maxYear)
            .attr("font-size", "10px")
            .attr("fill", "#94a3b8");

        return () => {
            tooltip.remove();
        };
            
    }, [data, selectedPlanet, onPlanetClick]);

    return <svg ref={svgRef} className="w-full h-[400px] bg-slate-900/50 rounded-lg text-slate-400" />;
};

interface DiscoveryBarChartProps {
    data: Planet[];
}

export const DiscoveryBarChart: React.FC<DiscoveryBarChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };

        // Process data: count planets per year
        const rollup = d3.rollup(data, v => v.length, d => d.disc_year);
        // Sort years
        const chartData = Array.from(rollup, ([year, count]) => ({ year, count }))
            .sort((a, b) => parseInt(a.year) - parseInt(b.year))
            .filter(d => d.year); // remove undefined years

        const x = d3.scaleBand()
            .domain(chartData.map(d => d.year))
            .range([margin.left, width - margin.right])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.count) || 10])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // Bars
        svg.append("g")
            .selectAll("rect")
            .data(chartData)
            .join("rect")
            .attr("x", d => x(d.year)!)
            .attr("y", d => y(d.count))
            .attr("height", d => y(0) - y(d.count))
            .attr("width", x.bandwidth())
            .attr("fill", "#6366f1")
            .attr("rx", 4);

        // Labels
        svg.append("g")
            .selectAll("text")
            .data(chartData)
            .join("text")
            .attr("x", d => x(d.year)! + x.bandwidth() / 2)
            .attr("y", d => y(d.count) - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .text(d => d.count);

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        // Y Axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5));

    }, [data]);

    return <svg ref={svgRef} className="w-full h-[300px] bg-slate-900/50 rounded-lg text-slate-400" />;
};

interface SizeCompProps {
    planet: Planet;
}

export const SizeComparison: React.FC<SizeCompProps> = ({ planet }) => {
     const svgRef = useRef<SVGSVGElement>(null);

     useEffect(() => {
        if (!svgRef.current || !planet.pl_rade) return;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        
        const width = svgRef.current.clientWidth;
        const height = 200;
        const centerX = width / 2;
        const centerY = height / 2;

        const maxRad = Math.max(1, planet.pl_rade);
        const scale = Math.min(width, height) / (2.5 * maxRad) / 20; 

        // Earth
        svg.append("circle")
            .attr("cx", centerX - (maxRad * 10 * scale) - 20)
            .attr("cy", centerY)
            .attr("r", 1 * 10 * scale) 
            .attr("fill", "#3b82f6")
            .attr("stroke", "white")
            .attr("stroke-width", 1);
        
        svg.append("text")
            .attr("x", centerX - (maxRad * 10 * scale) - 20)
            .attr("y", centerY + (1 * 10 * scale) + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .text("Earth");

        // Planet
        svg.append("circle")
            .attr("cx", centerX + (1 * 10 * scale) + 20)
            .attr("cy", centerY)
            .attr("r", planet.pl_rade * 10 * scale)
            .attr("fill", "#06b6d4")
            .attr("stroke", "white")
            .attr("stroke-width", 1);
            
        svg.append("text")
            .attr("x", centerX + (1 * 10 * scale) + 20)
            .attr("y", centerY + (planet.pl_rade * 10 * scale) + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "12px")
            .text(planet.pl_name);

     }, [planet]);

     return <svg ref={svgRef} className="w-full h-[200px] bg-slate-900/50 rounded-lg" />;
};
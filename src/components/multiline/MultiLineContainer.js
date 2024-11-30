import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import MultiLineD3 from "./MultiLine-d3"; // Import D3 class
import "./MultiLine.css"; // Import CSS
import { onHover, onClick, handleBrushed } from "../../redux/DataSetSlice";
import * as d3 from "d3";
function MultiLineContainer() {
    const dispatch = useDispatch();
    const seoulBikeData = useSelector((state) => state.dataSet.data);
    const brushSource = useSelector((state) => state.dataSet.brushSource);
    const brushedData = useSelector((state) => state.dataSet.brushedData);

    // Preprocess data for multi-line chart
    const preprocessData = (data) => {
        const groupedData = d3.groups(data, (d) => d.Seasons, (d) => d.Hour);
        
        const aggregatedData = [];
        groupedData.forEach(([season, hours]) => {
            hours.forEach(([hour, records]) => {
                const validRecords = records.filter((d) => d.RentedBikeCount > 0);
                if (validRecords.length>0){
                    const totalCount = d3.sum(records, (d) => d.RentedBikeCount);
                    const avgCount = totalCount / records.length;

                    aggregatedData.push({
                        season,
                        hour: parseInt(hour, 10),
                        rentedBikeCount: avgCount,
                    });
                }
                
            });
        });

        return aggregatedData;
    };
    console.log(preprocessData);
    const visData = preprocessData(
        Array.isArray(seoulBikeData)
            ? seoulBikeData.map((item) => ({
                  ...item,
                  RentedBikeCount: parseInt(item.RentedBikeCount, 10) || 0,
                  Hour: parseInt(item.Hour, 10) || 0,
              }))
            : []
    );
    console.log(visData);
    const divContainerRef = useRef(null);
    const multiLineRef = useRef(null);

    const getChartSize = () => {
        let width;
        let height;
        if (divContainerRef.current) {
            return {
                width: divContainerRef.current.offsetWidth,
                height: divContainerRef.current.offsetHeight,
            };
        }
        return { width, height}; // Default size
    };

    const handleBrush = (extent) => {
        if (extent) {
            const [x0, x1] = extent;
    
            // Filter data based on the hour range
            const filteredData = visData.filter((d) => d.hour >= x0 && d.hour <= x1);
    
            dispatch(
                handleBrushed({
                    type: "multiline", // Specify the brush source
                    brushedData: filteredData,
                })
            );
        } else {
            dispatch(handleBrushed({ type: "multiline", brushedData: [] }));
        }
    };

    useEffect(() => {
        const multiLine = new MultiLineD3(divContainerRef.current);
        multiLine.create({ size: getChartSize() });
        multiLineRef.current = multiLine;

        return () => {
            multiLine.clear();
        };
    }, []);

    useEffect(() => {
        if (visData.length === 0) return;

        const multiLine = multiLineRef.current;

        const handleOnHover = (itemData) => {
            dispatch(onHover(itemData));
        };

        const handleOnClick = (itemData) => {
            dispatch(onClick(itemData));
        };

        const handleBrushedData = (brushedData) => {
            dispatch(handleBrushed(brushedData));
        };

        
        

        const controllerMethods = {
            handleOnHover,
            handleOnClick,
            handleBrushed: handleBrush,
        };

        multiLine.renderMultiLineChart(visData, controllerMethods);
    }, [visData]);

    useEffect(() => {
        if (brushSource === 'scatterplot') {
            const multilineD3 = multiLineRef.current;
    
            // Update the multiline chart with the brushed data from the scatterplot
            multilineD3.updateBrushedElements(brushedData);
        }
    }, [brushSource, brushedData]);
    

    return (
        <div id="multiline-container" ref={divContainerRef} className="multilineDivContainer">
            {seoulBikeData.length === 0 ? <p>Loading data...</p> : null}
        </div>
    );
}

export default MultiLineContainer;

import './Scatterplot.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ScatterplotD3 from './Scatterplot-d3';
import { onHover, onClick, handleBrushed} from '../../redux/DataSetSlice';
function ScatterplotContainer() {
    const dispatch = useDispatch();
    // Access the data from Redux
    const seoulBikeData = useSelector((state) => state.dataSet.data);
    const brushSource = useSelector((state) => state.dataSet.brushSource);
    const brushedData = useSelector((state) => state.dataSet.brushedData);


    // Map data for the scatterplot
    const visData = Array.isArray(seoulBikeData)
    ? seoulBikeData.map((item) => ({
          x: item.Temperature,
          y: item.RentedBikeCount,
          hour: item.hour,
          value: item.Visibility,
          id: item.index,
      }))
    : [];
      console.log(visData)
    useEffect(() => {
        console.log('VisContainer useEffect (called each time matrix re-renders)');
    });

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null); 

    const getCharSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight;
        }
        return { width, height };
    };

    const handleBrush = (selection) => {
        if (selection && selection.length < 0) {
            const [[x0, y0], [x1, y1]] = selection; // Get the bounding box of the brush in pixel space
    
            // Map the pixel values back to the data domain using scales
            const tempRange = [scatterplotD3Ref.current.xScale.invert(x0), scatterplotD3Ref.current.xScale.invert(x1)];
            const bikeRange = [scatterplotD3Ref.current.yScale.invert(y1), scatterplotD3Ref.current.yScale.invert(y0)]; // Note: y is inverted
    
            // Filter the data based on the computed ranges
            const filteredData = visData.filter(
                (d) =>
                    d.x >= tempRange[0] &&
                    d.x <= tempRange[1] &&
                    d.y >= bikeRange[0] &&
                    d.y <= bikeRange[1]
            );
    
            dispatch(
                handleBrushed({
                    type: 'scatterplot', // Specify the brush source
                    brushedData: filteredData,
                })
            );
        } else {
            dispatch(handleBrushed({ type: 'scatterplot', brushedData: [] }));
        }
    };
    

    // Component Did Mount
    useEffect(() => {
        console.log('VisContainer useEffect [] called once the component did mount');
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: getCharSize() });
        scatterplotD3Ref.current = scatterplotD3;
        return () => {
            console.log('scatterplotContainer useEffect [] return function, called when the component did unmount...');
            scatterplotD3.clear();
        };
    }, []); // Called after the component is mounted

    // Component Did Update
    useEffect(() => {
        console.log('VisContainer useEffect with dependency [visData], called each time visData changes...');
        const scatterplotD3 = scatterplotD3Ref.current;

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

        scatterplotD3.renderScatterplot(visData, controllerMethods);
    }, [visData]); // Re-renders when visData changes

    useEffect(() => {
        if (brushSource === 'multiline') {
            const scatterplotD3 = scatterplotD3Ref.current;
    
            // Update the scatterplot with the brushed data from the multiline chart
            scatterplotD3.updateBrushedElements(brushedData);
        }
    }, [brushSource, brushedData]);
    
    return (
        <div id="scatterplot-container" ref={divContainerRef} className="scatterplotDivContainer">
            {seoulBikeData.length === 0 ? (
                <p>Loading data ...</p>
            ) : console.log('Scatterplot is rendered.')}
        </div>
    );
}

export default ScatterplotContainer;
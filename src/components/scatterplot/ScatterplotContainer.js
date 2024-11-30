import './Scatterplot.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ScatterplotD3 from './Scatterplot-d3';
import { onHover, onClick, handleBrushed} from '../../redux/DataSetSlice';
function ScatterplotContainer() {
    const dispatch = useDispatch();
    // Access the data from Redux
    const seoulBikeData = useSelector((state) => state.dataSet.data);

    // Map data for the scatterplot
    const visData = Array.isArray(seoulBikeData)
    ? seoulBikeData.map((item) => ({
          x: item.Temperature,
          y: item.RentedBikeCount,
          value: item.Visibility,
          id: item.index,
      }))
    : [];
      console.log(visData)
    useEffect(() => {
        console.log('VisContainer useEffect (called each time matrix re-renders)');
    });

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null); // Corrected from visD3Ref to scatterplotD3Ref

    const getCharSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight;
        }
        return { width, height };
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
            handleBrushed: handleBrushedData,
        };

        scatterplotD3.renderScatterplot(visData, controllerMethods);
    }, [visData]); // Re-renders when visData changes

    return (
        <div id="scatterplot-container" ref={divContainerRef} className="scatterplotDivContainer">
            {seoulBikeData.length === 0 ? (
                <p>Loading data ...</p>
            ) : console.log('Scatterplot is rendered.')}
        </div>
    );
}

export default ScatterplotContainer;
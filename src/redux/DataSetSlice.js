import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    return responseJson.data.map((item,i)=> ({...item,index:i}));
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
    data: [],
    hoveredItem: null,
    clickedItem: null,
    brushedData: [],
    brushSource: null,
  },
  reducers: {
      onHover: (state, action) => {
        state.hoveredItem = action.payload;
      },
      onClick: (state, action) => {
        state.clickedItem = action.payload;
      },
      handleBrushed: (state,action) => {
        const {type, brushedData} = action.payload;
        state.brushedData = brushedData;
        state.type=type;
      }
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
      state.data = action.payload
      // return action.payload
    });
  },
})

// Action creators are generated for each case reducer function
export const { onHover, onClick, handleBrushed } = dataSetSlice.actions;

export default dataSetSlice.reducer;
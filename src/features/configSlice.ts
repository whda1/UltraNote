import { createSlice } from '@reduxjs/toolkit'
import { constant } from '../constant'

const initState = {
    lastSavedPath : ""
}

export const configSlice = createSlice({
  name: 'config',
  initialState: initState,
  reducers: {
    [constant.clearState]:(state)=>{
        state = initState
    },
    [constant.setState]:(state,action)=>{
        state = action.payload
    }
  },
})

// Action creators are generated for each case reducer function


export default configSlice.reducer
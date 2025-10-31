import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { constant } from '../constant'
import { assignValue, isNullOrUndefined } from '../utils/helper'
import { act } from 'react'
import { List } from 'lodash'


type initStateType = {
  lastSaved:number,
  name:string,
  path:string,
}

const initState:Nullable<initStateType> = {
  lastSaved:null,
  name:null,
  path:null,
}

export const currentFile = createSlice({
  name: 'currentFile',
  initialState: initState,
  reducers: {
    [constant.clearState]:(state)=>{
        state = initState
    },
    [constant.setState]:(state,action:PayloadAction<{filePath:string,lastSaved:number|null}>)=>{
        if(isNullOrUndefined(action.payload.filePath))return
        const splittedPathList:string[] = action.payload.filePath.split('\\')         
        state.lastSaved = action.payload.lastSaved
        state.path = splittedPathList[0]+'\\\\'+ splittedPathList.slice(1,splittedPathList.length-1).join('\\')
        state.name = splittedPathList[splittedPathList.length-1]
    }
  },
})

// Action creators are generated for each case reducer function

export const currentFileSliceActions = currentFile.actions
export default currentFile.reducer
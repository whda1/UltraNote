import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { constant } from '../constant'
import { assignValue, isNullOrUndefined } from '../utils/helper'
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../app/store';
import { stat } from 'original-fs';
import { previousDay } from 'date-fns';


type initStateType = {
  lastSaved:number,
  name:string,
  path:string,
  fileContent:string,
  active:boolean,
  id:string
  title:string
  isDirty:boolean
}

export const initialFileContent = '{"editorState":{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}},"lastSaved":"null","source":"Lexical","version":"0.37.0"}'
const initState:Nullable<initStateType> = {
  lastSaved:null,
  name:null,
  path:null,
  fileContent:initialFileContent,
  active:true,
  id:null,
  title:"untitled",
  isDirty:false
}

const initFile = ()=>{
  const id = uuidv4()
  return {
    data:{
      [id]:{
      ...initState,
      id:id
      }
    },
    ids:[id]
  }
}

const createFile = ({filePath,fileContent,lastSaved,active,id,name,isDirty=false}:any)=>{
  const result:any = {}
  const pathSep = isNullOrUndefined(filePath) ? null : filePath.includes('\\')?'\\':'/'
  const splittedPathList:string[] = isNullOrUndefined(filePath) ? null : filePath.split(pathSep)
  result.lastSaved = lastSaved
  result.name = isNullOrUndefined(filePath) ? null : splittedPathList[splittedPathList.length-1]
  result.path = isNullOrUndefined(filePath) ? null : filePath.substring(0,filePath.lastIndexOf(pathSep+result.name))
  result.fileContent = fileContent??initialFileContent
  result.active = active
  result.title = name
  result.id = id
  result.isDirty = isDirty
  return result
}

export const FileSlice = createSlice({
  name: 'FileSlice',
  initialState: initFile(),
  reducers: {
    [constant.clearState]:(state)=>{
        state = {
          data:{},
          ids:[] as string[]
        }
    },
    [constant.setState]:(state,action:PayloadAction<{id:string|null,filePath:string|null,lastSaved:number|null,fileContent:string|null,active:boolean}>)=>{
        if(isNullOrUndefined(action.payload.id)){
          throw new Error("ID is required to set file state")
        }
        state.data[action.payload.id] = createFile({
          filePath:action.payload.filePath,
          fileContent:action.payload.fileContent,
          lastSaved:action.payload.lastSaved,
          active:action.payload.active,
          id:action.payload.id,
          name:action.payload.id
        })
        state.ids = Array.from(new Set([...state.ids,action.payload.id]))
    },
    [constant.toggleActive]:(state,action:PayloadAction<{id:string,fileContent:string}>)=>{
        if(isNullOrUndefined(action.payload.id)){
          throw new Error("ID is required to toggle active state")
        }
        const currentActiveFileContent = action.payload.fileContent
        for (const key in state.data){
          if(state.data[key].active === true){
            const previousActiveFileContent = state.data[key].fileContent
            if(previousActiveFileContent !== currentActiveFileContent){
              state.data[key].isDirty = true
              state.data[key].active = false
              state.data[key].fileContent = action.payload.fileContent
            }
          }
          state.data[key].active = action.payload.id === key
        }
    },
    [constant.addState]:(state,action:PayloadAction<{id:string|null,filePath:string|null,lastSaved:number|null,fileContent:string|null,active:boolean}>)=>{
        if(isNullOrUndefined(action.payload.id)){
          throw new Error("ID is required to set file state")
        }
        state.data[action.payload.id] = createFile({
          filePath:action.payload.filePath,
          fileContent:action.payload.fileContent,
          lastSaved:action.payload.lastSaved,
          active:action.payload.active,
          id:action.payload.id,
          name:action.payload.id
        })
        state.ids = Array.from(new Set([...state.ids,action.payload.id]))

        const currentActiveFileContent = action.payload.fileContent
        for (const key in state.data){
          if(state.data[key].active === true){
            const previousActiveFileContent = state.data[key].fileContent
            if(previousActiveFileContent !== currentActiveFileContent){
              state.data[key].isDirty = true
              state.data[key].active = false
              state.data[key].fileContent = action.payload.fileContent
            }
          }
          state.data[key].active = action.payload.id === key
        }

    },
    [constant.deleteState]:(state,action:PayloadAction<{id:string}>)=>{
        const newState =JSON.parse(JSON.stringify(state.data))
        delete newState[action.payload.id]
        console.log("logging new state")
        console.log(newState)
        state.data = newState
        const newIds = state.ids.filter(item=>item!==action.payload.id)
        const lastElement = newIds.length-1
        state.ids = newIds
        if(lastElement>=0) newState[state.ids[lastElement]].active = true
        console.log("logging state after delete")
        console.log(state.data)
    }
  }
})

export const selectFileSlice = (state:RootState) => state.FileSlice

export const testing = (state:RootState) => {
  return state.FileSlice.data
}

export const selectFiles = createSelector([selectFileSlice],(slice)=>{
      return slice.ids.map(itemKey=>{
        return slice.data[itemKey]
      })
  }
)

export const selectMemActiveFile = createSelector([selectFiles], (items)=>{
    for(const item of items){
        if(item.active===true){
            return item
        }
    }
  }
)


// Action creators are generated for each case reducer function

export const FileSliceAction = FileSlice.actions
export default FileSlice.reducer
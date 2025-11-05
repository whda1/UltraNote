import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { constant } from '../constant'
import { assignValue, isNullOrUndefined } from '../utils/helper'
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../app/store';
import equal from "fast-deep-equal/es6"


export type initStateType = {
  lastSaved:number,
  fileName:string,
  filePath:string,
  fileFullPath:string,
  fileContent:string,
  active:boolean,
  id:string,
  title?:string,
  isDirty:boolean,
  byType:"activeTabUpdated" | "saveWithDialog" | "saveWithoutDialog" | "import"
}

export const initialFileContent = '{"editorState":{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}},"lastSaved":"null","source":"Lexical","version":"0.37.0"}'
const initState:Nullable<initStateType> = {
  lastSaved:null,
  fileName:null,
  filePath:null,
  fileFullPath:null,
  fileContent:initialFileContent,
  active:true,
  id:null,
  title:"untitled",
  isDirty:false,
  byType:"activeTabUpdated"
}

const initFile = ()=>{
  const id = uuidv4()
  const file = createFile({...initState,id:id})
  return {
    data:{
      [id]:file
    },
    ids:[id]
  }
}

const createFile = ({lastSaved,fileName,fileContent,fileFullPath,filePath,id,isDirty,active,byType}:Nullable<initStateType>)=>{
  const titlePostfix = isDirty?" - *":""
  const result:any = {}
  result.filePath = filePath,
  result.fileName = fileName,
  result.fileFullPath = fileFullPath,
  result.lastSaved = lastSaved
  result.fileContent = fileContent??initialFileContent
  result.active = active
  // result.title ="🗂️ "+ (result.fileName ?? "untitled") + titlePostfix
  result.title = id
  result.id = id
  result.isDirty = isDirty
  result.byType = byType
  return result
}

function getIsDirty(previous:string,current:string){

  const currentActiveFileContent = JSON.parse(current)
  const previousActiveFileContent = JSON.parse(previous)

  const isDirty = !equal(previousActiveFileContent.editorState.root.children,currentActiveFileContent.editorState.root.children)
  return isDirty
}

function toggleActive(data:any,payload:any){
  for (const key in data){
    if(data[key].active === true && key !== payload.id){
      const isDirty = data[key].isDirty===true?true:getIsDirty(data[key].fileContent,payload.fileContent)
      data[key] = createFile({...data[key],isDirty:isDirty,active:false,fileContent:payload.fileContent,byType:"activeTabUpdated"})
      continue
    }
    data[key] = createFile({...data[key],active:key===payload.id, byType:"activeTabUpdated"})
  }
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
    [constant.setState]:(state,action:PayloadAction<Nullable<initStateType>>)=>{
        if(isNullOrUndefined(action.payload.id)){
          throw new Error("ID is required to set file state")
        }
        state.data[action.payload.id] = createFile({
          ...action.payload
        })
        state.ids = Array.from(new Set([...state.ids,action.payload.id]))
    },
    [constant.toggleActive]:(state,action:PayloadAction<{id:string,fileContent:string}>)=>{
        if(isNullOrUndefined(action.payload.id)){
          throw new Error("ID is required to toggle active state")
        }
        toggleActive(state.data,action.payload)
    },
    [constant.addState]:(state,action:PayloadAction<{id:string,fileContent:string}>)=>{
      if(isNullOrUndefined(action.payload.id)){
        throw new Error("ID is required to  add state")
      }
      toggleActive(state.data,action.payload)
      state.data[action.payload.id] = createFile({...initState,id:action.payload.id,active:true,byType:"activeTabUpdated"})
      state.ids = Array.from(new Set([...state.ids,action.payload.id]))
    },
    [constant.deleteState]:(state,action:PayloadAction<{id:string}>)=>{
        const newState =JSON.parse(JSON.stringify(state.data))
        delete newState[action.payload.id]
        state.data = newState
        const newIds = state.ids.filter(item=>item!==action.payload.id)
        const lastElementIndex = newIds.length-1
        state.ids = newIds
        if(lastElementIndex>=0) {
          const lastElementId = state.ids[lastElementIndex]
          state.data[lastElementId] = {...state.data[lastElementId],active:true,byType:"activeTabUpdated"} 
      }
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

export const selectMemActiveFile:(param:any)=>Nullable<initStateType> = createSelector([selectFiles], (items)=>{
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
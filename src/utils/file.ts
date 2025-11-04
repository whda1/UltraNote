import { editorStateFromSerializedDocument, serializedDocumentFromEditorState } from "@lexical/file";
import { CLEAR_HISTORY_COMMAND, LexicalEditor } from "lexical";
import { isNullOrUndefined } from "./helper";

export async function getImportFile(editor: LexicalEditor,fileContent:string) {
    editor.setEditorState(editorStateFromSerializedDocument(editor, fileContent));
}

type filePathObject = {
  fileName:string,
  filePath:string,
  fileFullPath:string
}
export function getFilePath(filePath:string){
  let pathSep = filePath
  const fileResult:Nullable<filePathObject> = {fileName:null,filePath:null,fileFullPath:null}
  if(isNullOrUndefined(filePath)){
    return fileResult
  }else{
    pathSep = filePath.includes('\\')?'\\':'/'
  }
  const splittedPathList:string[] = filePath.split(pathSep)
  fileResult.fileName=splittedPathList[splittedPathList.length-1]
  fileResult.filePath = filePath.substring(0,filePath.lastIndexOf(pathSep+name))
  fileResult.fileFullPath = filePath
  return fileResult
}
  

export async function getExportFile(
  editor: LexicalEditor,
  config: Readonly<{
    fileName?: string;
    source?: string;
  }> = Object.freeze({}),
) {
  const now = new Date().getTime();
  const serializedDocument = serializedDocumentFromEditorState(
    editor.getEditorState(),
    {
      ...config,
      lastSaved: now,
    },
  );
  const fileArrayBuffer =await getUint8ArrayFromBlob(serializedDocument);
  const fileName = config.fileName || "Note";
  return {
    fileContent:fileArrayBuffer,
    fileName:`${fileName}.lexical`,
    lastSaved:now
  }
}

// Adapted from https://stackoverflow.com/a/19328891/2013580
async function getUint8ArrayFromBlob(data: any) {
  const json = JSON.stringify(data);
  const blob = new Blob([json], {
    type: 'octet/stream',
  });
  try{
    const arrayBuffer = await blob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }
  catch{
    throw new Error("Error occur when transferring blob to array buffer!!!")
  }
}
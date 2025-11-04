import { Tabs } from "@sinm/react-chrome-tabs";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { v4 as uuidv4 } from 'uuid';
import { serializedDocumentFromEditorState } from "@lexical/file";
import { useDispatch } from "react-redux";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FileSliceAction, selectFiles, selectMemActiveFile } from "./features/FileSlice";
import { isNullOrUndefined } from "./utils/helper";
import { getFilePath, getImportFile } from "./utils/file";
import { useEffect } from "react";
import Button from "@mui/material/Button";

export function ChromeTab(){
  
  const [editor] = useLexicalComposerContext();
  const files = useAppSelector(selectFiles)
  const activeFile = useAppSelector(selectMemActiveFile)
  const dispatch = useDispatch()
  
  const addTab = () => {
    const newId = uuidv4()
    const fileContent = JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));
    dispatch(FileSliceAction.ADD_STATE({id:newId,fileContent}))
  };
  const active = (id: string) => {
    const fileContent = JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));
    dispatch(FileSliceAction.TOGGLE_ACTIVE({id:id,fileContent}));
  };

  const close = (id: string) => {
    dispatch(FileSliceAction.DELETE_STATE({id}));
  };

  useEffect(() => {
    if(isNullOrUndefined(activeFile)) return;
    getImportFile(editor,activeFile.fileContent??"");
  }, [activeFile]);

  return <Tabs
      onTabClose={close}
      onTabActive={active}
      onDragBegin={() => console.log('Drag started')}
      onDragEnd={() => console.log('Drag ended')}
      tabs={files as any}
      pinnedRight={<Button size='small' onClick={addTab}>+</Button>}
  />
}
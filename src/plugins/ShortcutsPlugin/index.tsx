/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {TOGGLE_LINK_COMMAND} from '@lexical/link';
import {HeadingTagType} from '@lexical/rich-text';
import {
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  isModifierMatch,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import {Dispatch, useEffect, useState} from 'react';

import {useToolbarState} from '../../context/ToolbarContext';
import {sanitizeUrl} from '../../utils/url';
import {INSERT_INLINE_COMMAND} from '../CommentPlugin';
import {
  clearFormatting,
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
  updateFontSize,
  UpdateFontSizeType,
} from '../ToolbarPlugin/utils';
import {
  isAddComment,
  isCapitalize,
  isCenterAlign,
  isClearFormatting,
  isDecreaseFontSize,
  isFormatBulletList,
  isFormatCheckList,
  isFormatCode,
  isFormatHeading,
  isFormatNumberedList,
  isFormatParagraph,
  isFormatQuote,
  isImportFile,
  isIncreaseFontSize,
  isIndent,
  isInsertCodeBlock,
  isInsertLink,
  isJustifyAlign,
  isLeftAlign,
  isLowercase,
  isOutdent,
  isRightAlign,
  isSaveFile,
  isSaveFileSilent,
  isStrikeThrough,
  isSubscript,
  isSuperscript,
  isUppercase,
} from './shortcuts';
import { FileSliceAction, initStateType, selectFiles, selectFileSlice, selectMemActiveFile } from '../../features/FileSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { serializedDocumentFromEditorState } from '@lexical/file';
import { getExportFile, getFilePath, getImportFile } from '../../utils/file';
import { isNullOrUndefined } from '../../utils/helper';

export default function ShortcutsPlugin({
  editor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  setIsLinkEditMode: Dispatch<boolean>;
}): null {
  const {toolbarState} = useToolbarState();
  // Editor state
  debugger
  const allFiles = useAppSelector(selectFileSlice)
  const activeFile:Nullable<initStateType> = useAppSelector(selectMemActiveFile)
  const dispatch = useAppDispatch()

  const saveFile = async ()=>{
    try{
      const {fileContent,fileName,lastSaved} = await getExportFile(editor,{fileName:activeFile?.fileName??undefined})
      const stringifiedContent = JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));
      const filePath = await window.ipcRenderer.saveWithDialog({fileContent,fileName})
      dispatch(FileSliceAction.SET_STATE({
        id:activeFile!.id,
        lastSaved,
        ...getFilePath(filePath),
        fileContent:stringifiedContent,
        active:true,
        isDirty:false,
        byType:"saveWithDialog"
      }))
      console.log(allFiles)
    }
    catch{
        throw new Error("Error occurs when saving ")
    
    }
  }

  const saveFileSilent = async ()=>{
    try{
      const {fileContent,fileName,lastSaved} = await getExportFile(editor,{fileName:activeFile?.fileName??undefined})
      const stringifiedContent = JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));
      await window.ipcRenderer.saveWithoutDialog({fileContent:stringifiedContent,fileName:`${activeFile.fileName}`,filePath:activeFile.filePath})
      dispatch(FileSliceAction.SET_STATE({
        ...activeFile,
        id:activeFile!.id,
        lastSaved,
        fileContent:stringifiedContent,
        active:true,
        isDirty:false,
        byType:"saveWithoutDialog"
      }))
    }catch{
      throw new Error("Error occurs during slient file export")
    }
  }

  const importFile = async ()=>{
    try{
      const {fileContent,filePath} = await window.ipcRenderer.readFileWithDialog()
      getImportFile(editor,fileContent)
      dispatch(FileSliceAction.SET_STATE({...activeFile,...getFilePath(filePath), lastSaved:null, fileContent,isDirty:false,byType:"import"} as any) )
    }catch{
      throw new Error("Error occurs during file import")
    }
  }

  useEffect(()=>{
    debugger
    console.log(selectMemActiveFile)
    console.log(selectFiles)
  },[selectMemActiveFile,selectFiles])

  useEffect(() => {
    const keyboardShortcutsHandler = (event: KeyboardEvent) => {
      // Short-circuit, a least one modifier must be set
      if (isModifierMatch(event, {})) {
        return false;
      } else if (isFormatParagraph(event)) {
        formatParagraph(editor);
      } else if (isFormatHeading(event)) {
        const {code} = event;
        const headingSize = `h${code[code.length - 1]}` as HeadingTagType;
        formatHeading(editor, toolbarState.blockType, headingSize);
      } else if (isFormatBulletList(event)) {
        formatBulletList(editor, toolbarState.blockType);
      } else if (isFormatNumberedList(event)) {
        formatNumberedList(editor, toolbarState.blockType);
      } else if (isFormatCheckList(event)) {
        formatCheckList(editor, toolbarState.blockType);
      } else if (isFormatCode(event)) {
        formatCode(editor, toolbarState.blockType);
      } else if (isFormatQuote(event)) {
        formatQuote(editor, toolbarState.blockType);
      } else if (isStrikeThrough(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      } else if (isLowercase(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase');
      } else if (isUppercase(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase');
      } else if (isCapitalize(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize');
      } else if (isIndent(event)) {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      } else if (isOutdent(event)) {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      } else if (isCenterAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      } else if (isLeftAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      } else if (isRightAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      } else if (isJustifyAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      } else if (isSubscript(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
      } else if (isSuperscript(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      } else if (isInsertCodeBlock(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
      } else if (isIncreaseFontSize(event)) {
        updateFontSize(
          editor,
          UpdateFontSizeType.increment,
          toolbarState.fontSizeInputValue,
        );
      } else if (isDecreaseFontSize(event)) {
        updateFontSize(
          editor,
          UpdateFontSizeType.decrement,
          toolbarState.fontSizeInputValue,
        );
      } else if (isClearFormatting(event)) {
        clearFormatting(editor);
      } else if (isInsertLink(event)) {
        const url = toolbarState.isLink ? null : sanitizeUrl('https://');
        setIsLinkEditMode(!toolbarState.isLink);
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      } else if (isAddComment(event)) {
        editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
      } else if (isSaveFile(event)){
        saveFile()
        console.log("saving file")
        
      }
      else if (isSaveFileSilent(event)){
        debugger
        if(isNullOrUndefined(activeFile?.fileFullPath)){
          saveFile()
          console.log("saving file")
        }
        else{
          saveFileSilent()
          console.log("saving file silently")
        }

      }else if (isImportFile(event)){
        importFile()
        console.log("importing file")
      }
      else {
        // No match for any of the event handlers
        return false;
      } 
      event.preventDefault();
      return true;
    };

    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      keyboardShortcutsHandler,
      COMMAND_PRIORITY_NORMAL,
    );
  }, [
    editor,
    toolbarState.isLink,
    toolbarState.blockType,
    toolbarState.fontSizeInputValue,
    setIsLinkEditMode,
    activeFile
  ]);

  return null;
}


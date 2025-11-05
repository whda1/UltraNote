/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX, KeyboardEventHandler} from 'react';

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {ClickableLinkPlugin} from '@lexical/react/LexicalClickableLinkPlugin';
import {
  CollaborationPlugin,
  CollaborationPluginV2__EXPERIMENTAL,
} from '@lexical/react/LexicalCollaborationPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {SelectionAlwaysOnDisplay} from '@lexical/react/LexicalSelectionAlwaysOnDisplay';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {CAN_USE_DOM} from '@lexical/utils';
import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {Doc} from 'yjs';

import {useSettings} from './context/SettingsContext';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPrismPlugin from './plugins/CodeHighlightPrismPlugin';
import CodeHighlightShikiPlugin from './plugins/CodeHighlightShikiPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import CommentPlugin from './plugins/CommentPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DateTimePlugin from './plugins/DateTimePlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';
import FigmaPlugin from './plugins/FigmaPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import {LayoutPlugin} from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import PollPlugin from './plugins/PollPlugin';
import ShortcutsPlugin from './plugins/ShortcutsPlugin';
import SpecialTextPlugin from './plugins/SpecialTextPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import {VersionsPlugin} from './plugins/VersionsPlugin';
import YouTubePlugin from './plugins/YouTubePlugin';
import ContentEditable from './ui/ContentEditable';
import { getExportFile,getFilePath,getImportFile } from './utils/file';
import { Menu } from 'electron';
import { useDispatch } from 'react-redux';
import { FileSliceAction, initialFileContent, initStateType, selectFiles, selectFileSlice, selectMemActiveFile } from './features/FileSlice';
import { useAppSelector } from './app/hooks';
import { isNullOrUndefined } from './utils/helper';
import { AutoIndentationPlugin } from './plugins/IndentationPlugin';
import { Tabs } from "@sinm/react-chrome-tabs";
import '@sinm/react-chrome-tabs/css/chrome-tabs.css';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';
import { serializedDocumentFromEditorState } from '@lexical/file';
import { ChromeTab } from './ChromeTab';

import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { CalendarCX } from './Calendar';

const COLLAB_DOC_ID = 'main';

const skipCollaborationInit =
  // @ts-expect-error
  window.parent != null && window.parent.frames.right === window;

export default function Editor(): JSX.Element {

  const {historyState} = useSharedHistoryContext();
  const {
    settings: {
      isCodeHighlighted,
      isCodeShiki,
      isCollab,
      useCollabV2,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      hasLinkAttributes,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
      tableHorizontalScroll,
      shouldAllowHighlightingWithBrackets,
      selectionAlwaysOnDisplay,
      listStrictIndent,
    },
  } = useSettings();

  const activeFile:Nullable<initStateType> = useAppSelector(selectMemActiveFile)
  const dispatch = useDispatch()

  const isEditable = useLexicalEditable();
  const placeholder = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
      ? 'Enter some rich text...'
      : 'Enter some plain text...';
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };




  const handleKeyUp:KeyboardEventHandler<HTMLDivElement> = async (event)=>{
    
    if(event.ctrlKey===true && event.key.toLowerCase()==='s'){
      const {fileContent,fileName,lastSaved} = await getExportFile(editor,{fileName:activeFile?.fileName??undefined})
      // Do when currentFile is null or shiftKey is also press
      // shirftKey pressed indicates Save as action
      const stringifiedContent = JSON.stringify(serializedDocumentFromEditorState(editor.getEditorState()));
      if(isNullOrUndefined(activeFile?.fileFullPath) || event.shiftKey===true){
        try{
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
        }catch{
          throw new Error("Error occurs during file export")
        }
      }else{
        try{
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
      
    }else if (event.ctrlKey === true && event.key.toLowerCase() === 'i'){
      try{
        const {fileContent,filePath} = await window.ipcRenderer.readFileWithDialog()
        getImportFile(editor,fileContent)
        
        dispatch(FileSliceAction.SET_STATE({...activeFile,...getFilePath(filePath), lastSaved:null, fileContent,isDirty:false,byType:"import"} as any) )
      }catch{
        throw new Error("Error occurs during file import")
      }
    }
  }


  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);
  
  return (
    <>
      <ChromeTab/>
      { activeFile &&
        <>
        {isRichText && (
          <ToolbarPlugin
            editor={editor}
            activeEditor={activeEditor}
            setActiveEditor={setActiveEditor}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}
        {/* <CalendarCX></CalendarCX> */}
        {isRichText && (
          <ShortcutsPlugin
            editor={activeEditor}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}
        <div
          onKeyUp={handleKeyUp}
          className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
            !isRichText ? 'plain-text' : ''
          }`}>
          {isMaxLength && <MaxLengthPlugin maxLength={30} />}
          <DragDropPaste />
          <AutoFocusPlugin />
          {selectionAlwaysOnDisplay && <SelectionAlwaysOnDisplay />}
          <ClearEditorPlugin />
          <ComponentPickerPlugin />
          <EmojiPickerPlugin />
          <AutoEmbedPlugin />
          <MentionsPlugin />
          <EmojisPlugin />
          <HashtagPlugin />
          <KeywordsPlugin />
          <SpeechToTextPlugin />
          <AutoLinkPlugin />
          <DateTimePlugin />
          {isRichText ? (
            <>
              <HistoryPlugin externalHistoryState={historyState} />
              <RichTextPlugin
                contentEditable={
                  <div className="editor-scroller">
                    <div className="editor" ref={onRef}>
                      <ContentEditable placeholder={placeholder} />
                    </div>
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <MarkdownShortcutPlugin />
              {isCodeHighlighted &&
                (isCodeShiki ? (
                  <CodeHighlightShikiPlugin />
                ) : (
                  <CodeHighlightPrismPlugin />
                ))}
              <ListPlugin hasStrictIndent={listStrictIndent} />
              <CheckListPlugin />
              <TablePlugin
                hasCellMerge={tableCellMerge}
                hasCellBackgroundColor={tableCellBackgroundColor}
                hasHorizontalScroll={tableHorizontalScroll}
              />
              <TableCellResizer />
              <ImagesPlugin />
              <LinkPlugin hasLinkAttributes={hasLinkAttributes} />
              <PollPlugin />
              <TwitterPlugin />
              <YouTubePlugin />
              <FigmaPlugin />
              <ClickableLinkPlugin disabled={isEditable} />
              <HorizontalRulePlugin />
              <EquationsPlugin />
              <ExcalidrawPlugin />
              <TabFocusPlugin />
              <TabIndentationPlugin  />
              <CollapsiblePlugin />
              <PageBreakPlugin />
              <LayoutPlugin />
              {floatingAnchorElem && (
                <>
                  <FloatingLinkEditorPlugin
                    anchorElem={floatingAnchorElem}
                    isLinkEditMode={isLinkEditMode}
                    setIsLinkEditMode={setIsLinkEditMode}
                  />
                  <TableCellActionMenuPlugin
                    anchorElem={floatingAnchorElem}
                    cellMerge={true}
                  />
                </>
              )}
              {floatingAnchorElem && !isSmallWidthViewport && (
                <>
                  <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                  <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                  <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
                  <FloatingTextFormatToolbarPlugin
                    anchorElem={floatingAnchorElem}
                    setIsLinkEditMode={setIsLinkEditMode}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <PlainTextPlugin
                contentEditable={<ContentEditable placeholder={placeholder} />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin externalHistoryState={historyState} />
            </>
          )}
          {(isCharLimit || isCharLimitUtf8) && (
            <CharacterLimitPlugin
              charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
              maxLength={5}
            />
          )}
          {/* {isAutocomplete && <AutocompletePlugin />}
          <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
          {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
          {shouldAllowHighlightingWithBrackets && <SpecialTextPlugin />} */}
          {/* <ActionsPlugin
            shouldPreserveNewLinesInMarkdown={shouldPreserveNewLinesInMarkdown}
            useCollabV2={useCollabV2}
          /> */}
        </div>
        {/* {showTreeView && <TreeViewPlugin />} */}
        <AutoIndentationPlugin/>
        </>
      }
    </>
  );
}


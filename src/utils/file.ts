import { editorStateFromSerializedDocument } from "@lexical/file";
import { CLEAR_HISTORY_COMMAND, LexicalEditor } from "lexical";

export function importFile(editor: LexicalEditor) {
    readTextFileFromSystem((text) => {
      editor.setEditorState(editorStateFromSerializedDocument(editor, text));
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    });
  }
  
function readTextFileFromSystem(callback: (text: string) => void) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lexical';
    input.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;
  
      if (target.files) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
  
        reader.onload = (readerEvent) => {
          if (readerEvent.target) {
            const content = readerEvent.target.result;
            callback(content as string);
          }
        };
      }
    });
    input.click();
  }
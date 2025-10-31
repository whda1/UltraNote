import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $addUpdateTag, $createParagraphNode, $getSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_NORMAL, ElementNode, KEY_DELETE_COMMAND, KEY_DOWN_COMMAND, KEY_ENTER_COMMAND, ParagraphNode } from "lexical";
import { useEffect } from "react";
import { isNullOrUndefined } from "../../utils/helper";
import { $insertNodeToNearestRoot } from "@lexical/utils";

const getPararaphNode = (node:ElementNode)=>{
    let currentNode: any = node
    while(true){
        let currentType = currentNode.getType().toLowerCase()
        if(currentType==="paragraph"){
            return currentNode
        }else if(currentType === "root"){
            console.log("Cannot find paragraph element")
            return null
        }else{
            currentNode = currentNode.getParent()
        }
    }
}

export function AutoIndentationPlugin(){
    const [editor] = useLexicalComposerContext();

    const onEnterPressHandler = (event:KeyboardEvent)=>{
        debugger
        const selection = $getSelection();
        const nodes = selection?.getNodes()
        if(isNullOrUndefined(nodes)) return false
        const previousNode = getPararaphNode(nodes![0] as ElementNode)
        if(!isNullOrUndefined(previousNode)) {
            event.preventDefault()
            editor.update(()=>{
                $addUpdateTag("auto-indentation")
                const newParagraphNode = $createParagraphNode()
                newParagraphNode.setIndent(previousNode.getIndent())
                const insertedNode = $insertNodeToNearestRoot(newParagraphNode)
                // Somehow the an additional line is created
                insertedNode.remove()
            })
            return true
        }
        return false
    }

    useEffect(() => {
        return editor.registerCommand(
            KEY_ENTER_COMMAND,
            onEnterPressHandler,
            COMMAND_PRIORITY_NORMAL,
          );
    },[editor])
    return null
}
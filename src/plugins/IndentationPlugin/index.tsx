import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $addUpdateTag, $createParagraphNode, $getNearestNodeFromDOMNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_NORMAL, ElementNode, INSERT_PARAGRAPH_COMMAND, KEY_DELETE_COMMAND, KEY_DOWN_COMMAND, KEY_ENTER_COMMAND, ParagraphNode } from "lexical";
import { useEffect } from "react";
import { isNullOrUndefined } from "../../utils/helper";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { NewParagraphNode } from "../../nodes/NewParagraphNode";

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

    const onEnterPressHandler = (node:any)=>{
        const pNode:NewParagraphNode = node
        if(isNullOrUndefined(pNode) || pNode.getIsNew()===false){
            return
        }
        const prevPNode:ParagraphNode | null = pNode.getPreviousSibling()
        if(
            !isNullOrUndefined(prevPNode) &&
            (prevPNode instanceof ParagraphNode) &&
            pNode.getIndent()!==prevPNode.getIndent()
        )
        {
            pNode.setIndent(prevPNode.getIndent())
        }
        pNode.setIsNew(false)
        return
    }

    useEffect(() => {
        return editor.registerNodeTransform(
            ParagraphNode,
            onEnterPressHandler
          );
    },[editor])
    return null
}
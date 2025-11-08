import { $applyNodeReplacement, EditorConfig, NodeKey, ParagraphNode, SerializedParagraphNode } from "lexical";

export class NewParagraphNode extends ParagraphNode{
    __isNew:boolean;
    constructor(key?: NodeKey,isNew?:boolean, ){
        super(key);
        // This varaible is not meant to be serialized
        this.__isNew = isNew??true;
    }

    static getType() {
        return 'new-paragraph';
    }
    
    static clone(node:NewParagraphNode){
        return new NewParagraphNode(node.__key,node.__isNew)
    }

    setIsNew(isNew:boolean): this {
        // getWritable() creates a clone of the node
        // if needed, to ensure we don't try and mutate
        // a stale version of this node.
        const self = this.getWritable();
        self.__isNew = isNew;
        return self;
    }

    getIsNew(): boolean {
        // getLatest() ensures we are getting the most
        // up-to-date value from the EditorState.
        const self = this.getLatest();
        return self.__isNew;
    }
    
    createDOM(config: EditorConfig) {
        const el = super.createDOM(config);
        return el;
    }
    
    static importJSON(json: SerializedParagraphNode): NewParagraphNode  {
        return $createNewParagraphNode().updateFromJSON(json);
    }


}

export function $createNewParagraphNode() {
        return $applyNodeReplacement(new NewParagraphNode());
}
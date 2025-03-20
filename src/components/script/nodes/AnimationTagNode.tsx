import { DecoratorNode, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode } from 'lexical';
import React, { JSX } from 'react';

export type SerializedAnimationTagNode = SerializedLexicalNode & {
  markerId?: string;
  type: 'animation-tag';
  version: 1;
};

export class AnimationTagNode extends DecoratorNode<JSX.Element> {
  __markerId?: string;

  static getType(): string {
    return 'animation-tag';
  }

  static clone(node: AnimationTagNode): AnimationTagNode {
    return new AnimationTagNode(node.__markerId, node.__key);
  }

  constructor(markerId?: string, key?: NodeKey) {
    super(key);
    this.__markerId = markerId;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'animation-tag';
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mx-0.5 bg-primary/10 text-primary`}
        contentEditable={false}
      >
        <span>动画</span>
      </span>
    );
  }

  getMarkerId(): string | undefined {
    return this.__markerId;
  }

  setMarkerId(markerId: string): void {
    this.getWritable().__markerId = markerId;
  }

  exportJSON(): SerializedAnimationTagNode {
    return {
      type: 'animation-tag',
      markerId: this.__markerId,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedAnimationTagNode): AnimationTagNode {
    return new AnimationTagNode(serializedNode.markerId);
  }
}

export function $createAnimationTagNode(markerId?: string): AnimationTagNode {
  return new AnimationTagNode(markerId);
}

export function $isAnimationTagNode(node: LexicalNode | null | undefined): node is AnimationTagNode {
  return node instanceof AnimationTagNode;
}
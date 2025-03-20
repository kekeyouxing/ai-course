import { DecoratorNode, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode } from 'lexical';
import React, { JSX } from 'react';

export type SerializedTimeTagNode = SerializedLexicalNode & {
  seconds: number;
  type: 'time-tag';
  version: 1;
};

export class TimeTagNode extends DecoratorNode<JSX.Element> {
  __seconds: number;

  static getType(): string {
    return 'time-tag';
  }

  static clone(node: TimeTagNode): TimeTagNode {
    return new TimeTagNode(node.__seconds, node.__key);
  }

  constructor(seconds: number, key?: NodeKey) {
    super(key);
    this.__seconds = seconds;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const className = config.theme.timeTag || 'time-tag';
    span.className = className;
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
        <span className="mr-1">暂停</span>
        <span className="time-value">{this.__seconds}</span>
        <span className="ml-1">秒</span>
      </span>
    );
  }

  getSeconds(): number {
    return this.__seconds;
  }

  setSeconds(seconds: number): void {
    this.getWritable().__seconds = seconds;
  }

  exportJSON(): SerializedTimeTagNode {
    return {
      type: 'time-tag',
      seconds: this.__seconds,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedTimeTagNode): TimeTagNode {
    return new TimeTagNode(serializedNode.seconds);
  }
}

export function $createTimeTagNode(seconds: number): TimeTagNode {
  return new TimeTagNode(seconds);
}

export function $isTimeTagNode(node: LexicalNode | null | undefined): node is TimeTagNode {
  return node instanceof TimeTagNode;
}
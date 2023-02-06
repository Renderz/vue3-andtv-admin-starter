declare interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
  $el: T;
}

declare type ComponentRef<T extends HTMLElement = HTMLDivElement> = ComponentElRef<T> | null;

declare type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

declare namespace JSX {
  import type { ComponentRenderProxy } from 'vue';
  // tslint:disable no-empty-interface
  type Element = VNode;
  // tslint:disable no-empty-interface
  type ElementClass = ComponentRenderProxy;
  interface ElementAttributesProperty {
    $props: any;
  }
  interface IntrinsicElements {
    [elem: string]: any;
  }
  interface IntrinsicAttributes {
    [elem: string]: any;
  }
}

declare module 'vue' {
  import type { ComponentPublicInstance, FunctionalComponent } from 'vue';
  export type JSXComponent<Props = any> = { new (): ComponentPublicInstance<Props> } | FunctionalComponent<Props>;
}

export {};

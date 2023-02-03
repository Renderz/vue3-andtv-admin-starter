import type { ComponentPublicInstance, FunctionalComponent, ComponentRenderProxy } from 'vue';

declare module 'vue' {
  export type JSXComponent<Props = any> = { new (): ComponentPublicInstance<Props> } | FunctionalComponent<Props>;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const Component: DefineComponent<{}, {}, any>;
  export default Component;
}

declare interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
  $el: T;
}

declare type ComponentRef<T extends HTMLElement = HTMLDivElement> = ComponentElRef<T> | null;

declare type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

declare namespace JSX {
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

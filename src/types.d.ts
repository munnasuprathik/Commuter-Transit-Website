/// <reference types="vite/client" />
import * as React from 'react';

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 
        icon: string; 
        width?: string | number; 
        height?: string | number;
        style?: React.CSSProperties; 
        className?: string;
      };
    }
  }
}

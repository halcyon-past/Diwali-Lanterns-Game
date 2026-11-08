declare module 'gif.js' {
  export interface GifOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | number | null;
    dither?: boolean | string;
    debug?: boolean;
  }

  export interface FrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  export default class GIF {
    constructor(options?: GifOptions);
    addFrame(
      image: CanvasImageSource | CanvasRenderingContext2D | ImageData,
      options?: FrameOptions
    ): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob, data: Uint8Array) => void): void;
    on(event: 'progress', callback: (percent: number) => void): void;
    on(event: 'abort', callback: () => void): void;
    abort(): void;
  }
}

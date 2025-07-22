declare module 'html2canvas' {
  interface Html2CanvasOptions {
    /** Whether to allow cross-origin images to taint the canvas */
    allowTaint?: boolean;
    /** Whether to test each image if it taints the canvas before applying it */
    useCORS?: boolean;
    /** Virtually scrolls to specified x/y positions and takes screenshot in multiple parts */
    scrollX?: number;
    scrollY?: number;
    /** A number between 0 and 1 indicating image quality */
    scale?: number;
    /** A predefined width for the canvas */
    width?: number;
    /** A predefined height for the canvas */
    height?: number;
    /** The x-coordinate to start clipping from */
    x?: number;
    /** The y-coordinate to start clipping from */
    y?: number;
    /** A string value for the background color */
    backgroundColor?: string;
    /** A string for the window context to render in */
    windowWidth?: number;
    windowHeight?: number;
    /** Whether to log activity */
    logging?: boolean;
    /** Proxy URL to use for cross-origin image requests */
    proxy?: string;
    /** Whether to remove the canvas clone from the DOM after rendering */
    removeContainer?: boolean;
    /** The Document to use for rendering */
    foreignObjectRendering?: boolean;
    /** The scaling factor */
    ignoreElements?: (element: HTMLElement) => boolean;
    /** Whether to enable experimental foreign object rendering */
    onclone?: (document: Document) => void;
    /** Callback function to call when successfully rendered */
    imageTimeout?: number;
    /** Timeout for images (in milliseconds) */
    cacheBust?: boolean;
    /** Whether to add random query string to images to avoid caching */
  }

  /**
   * Takes a screenshot of the current document
   * @param element The element to render
   * @param options The options for rendering
   */
  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;

  export default html2canvas;
}
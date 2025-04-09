/**
 * Module declarations for external libraries without TypeScript definitions
 */

// Declaration for bad-words profanity filter
declare module 'bad-words' {
  export default class Filter {
    constructor(options?: { 
      placeHolder?: string; 
      regex?: RegExp;
      replaceRegex?: RegExp;
      emptyList?: boolean;
      list?: string[];
      exclude?: string[];
    });
    clean(text: string): string;
    isProfane(text: string): boolean;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
    replaceWord(word: string, replacement: string): void;
  }
}

// Declaration for leo-profanity filter
declare module 'leo-profanity' {
  interface ProfanityFilter {
    list: () => string[];
    add: (words: string | string[]) => string[];
    remove: (words: string | string[]) => string[];
    reset: () => string[];
    loadDictionary: (key?: string) => string[];
    getDictionary: () => { [key: string]: string[] };
    clearList: () => string[];
    check: (text: string) => boolean;
    clean: (text: string, replaceKey?: string) => string;
    filter: (text: string, replaceKey?: string) => string;
  }

  const filter: ProfanityFilter;
  export default filter;
}

// Declaration for react-type-animation
declare module 'react-type-animation' {
  import * as React from 'react';

  export interface TypeAnimationProps {
    sequence: (string | number | (() => void) | (() => Promise<void>))[];
    wrapper?: string | React.ComponentType<any>;
    repeat?: number | Infinity;
    cursor?: boolean;
    speed?: number;
    deletionSpeed?: number;
    omitDeletionAnimation?: boolean;
    preRenderFirstString?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }

  export const TypeAnimation: React.FC<TypeAnimationProps>;
}

// Declaration for react-modal
declare module 'react-modal' {
  import * as React from 'react';

  export interface ReactModalProps {
    isOpen: boolean;
    onAfterOpen?: () => void;
    onAfterClose?: () => void;
    onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
    closeTimeoutMS?: number;
    style?: {
      content?: React.CSSProperties;
      overlay?: React.CSSProperties;
    };
    contentLabel?: string;
    portalClassName?: string;
    overlayClassName?: string | {
      base: string;
      afterOpen: string;
      beforeClose: string;
    };
    className?: string | {
      base: string;
      afterOpen: string;
      beforeClose: string;
    };
    bodyOpenClassName?: string;
    htmlOpenClassName?: string;
    ariaHideApp?: boolean;
    shouldFocusAfterRender?: boolean;
    shouldCloseOnOverlayClick?: boolean;
    shouldCloseOnEsc?: boolean;
    shouldReturnFocusAfterClose?: boolean;
    role?: string;
    contentRef?: (node: HTMLElement) => void;
    overlayRef?: (node: HTMLElement) => void;
    parentSelector?: () => HTMLElement;
    aria?: {
      [key: string]: string;
    };
    data?: {
      [key: string]: string;
    };
    testId?: string;
    children?: React.ReactNode;
  }

  export default class Modal extends React.Component<ReactModalProps> {
    static setAppElement(element: string | HTMLElement): void;
  }
}

// Declaration for react-speech-kit
declare module 'react-speech-kit' {
  export interface SpeechSynthesisVoice {
    default: boolean;
    lang: string;
    localService: boolean;
    name: string;
    voiceURI: string;
  }

  export interface SpeechSynthesisUtteranceOptions {
    voice?: SpeechSynthesisVoice;
    text?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }

  export interface UseSpeechSynthesisOptions {
    onEnd?: () => void;
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onBoundary?: (event: SpeechSynthesisEvent) => void;
    onError?: (event: SpeechSynthesisErrorEvent) => void;
  }

  export interface UseSpeechSynthesisProps {
    speak: (options: SpeechSynthesisUtteranceOptions) => void;
    cancel: () => void;
    speaking: boolean;
    voices: SpeechSynthesisVoice[];
    supported: boolean;
  }

  export function useSpeechSynthesis(options?: UseSpeechSynthesisOptions): UseSpeechSynthesisProps;

  export interface UseSpeechRecognitionOptions {
    onEnd?: () => void;
    onStart?: () => void;
    onError?: (event: SpeechRecognitionErrorEvent) => void;
    onResult?: (event: SpeechRecognitionEvent) => void;
  }

  export interface UseSpeechRecognitionProps {
    listen: (options?: { interimResults?: boolean; lang?: string }) => void;
    stop: () => void;
    listening: boolean;
    supported: boolean;
    transcript: string;
  }

  export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): UseSpeechRecognitionProps;
}

// We've removed the jwt-decode library and now use a custom implementation

// Declaration for react-beautiful-dnd
declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  // DragDropContext
  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: DragStart) => void;
    onDragUpdate?: (update: DragUpdate) => void;
    children?: React.ReactNode;
  }
  export const DragDropContext: React.FC<DragDropContextProps>;

  // Droppable
  export interface DroppableProps {
    droppableId: string;
    type?: string;
    direction?: 'horizontal' | 'vertical';
    isDropDisabled?: boolean;
    ignoreContainerClipping?: boolean;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode;
  }
  export const Droppable: React.FC<DroppableProps>;

  // Draggable
  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode;
  }
  export const Draggable: React.FC<DraggableProps>;

  // DroppableProvided
  export interface DroppableProvided {
    innerRef: React.Ref<any>;
    droppableProps: {
      [key: string]: any;
    };
    placeholder?: React.ReactNode;
  }

  // DraggableProvided
  export interface DraggableProvided {
    innerRef: React.Ref<any>;
    draggableProps: {
      [key: string]: any;
    };
    dragHandleProps?: {
      [key: string]: any;
    };
  }

  // DroppableStateSnapshot
  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: string;
    draggingFromThisWith?: string;
  }

  // DraggableStateSnapshot
  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver?: string;
    dropAnimation?: DropAnimation;
    combineWith?: string;
    combineTargetFor?: string;
  }

  // DropAnimation
  export interface DropAnimation {
    duration: number;
    curve: string;
    moveTo: {
      x: number;
      y: number;
    };
  }

  // DropResult
  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    };
    reason: 'DROP' | 'CANCEL';
    combine?: {
      draggableId: string;
      droppableId: string;
    };
    mode: 'FLUID' | 'SNAP';
  }

  // DragStart and DragUpdate
  export interface DragStart {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    mode: 'FLUID' | 'SNAP';
  }

  export interface DragUpdate extends DragStart {
    destination?: {
      droppableId: string;
      index: number;
    };
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }
}

// Declaration for react-comments-section
declare module 'react-comments-section' {
  import * as React from 'react';

  export interface CommentData {
    userId: string;
    comId: string;
    fullName: string;
    avatarUrl: string;
    text: string;
    userProfile?: string;
    replies?: CommentData[];
    votes?: number;
    date?: string;
  }

  export interface CurrentUser {
    currentUserId: string;
    currentUserFullName: string;
    currentUserProfile?: string;
    currentUserImg?: string;
  }

  export interface LogIn {
    loginLink: string;
    signupLink: string;
  }

  export interface CommentsProps {
    commentData?: CommentData[];
    currentUser?: CurrentUser;
    logIn?: LogIn;
    onSubmitAction?: (data: any) => void;
    onDeleteAction?: (data: any) => void;
    onReplyAction?: (data: any) => void;
    onEditAction?: (data: any) => void;
    onVoteAction?: (data: any) => void;
    advancedInput?: boolean;
    hrStyle?: React.CSSProperties;
    submitBtnStyle?: React.CSSProperties;
    titleStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    formStyle?: React.CSSProperties;
    replyInputStyle?: React.CSSProperties;
    className?: string;
    currentData?: (data: CommentData[]) => void;
  }

  export const CommentsSection: React.FC<CommentsProps>;
}

// Declaration for react-pdf
declare module '@react-pdf/renderer' {
  import * as React from 'react';

  // Document
  export interface DocumentProps {
    children?: React.ReactNode;
  }
  export const Document: React.FC<DocumentProps>;

  // Page
  export interface PageProps {
    size?: string | [number, number];
    orientation?: 'portrait' | 'landscape';
    style?: React.CSSProperties;
    wrap?: boolean;
    children?: React.ReactNode;
  }
  export const Page: React.FC<PageProps>;

  // Text
  export interface TextProps {
    style?: React.CSSProperties;
    wrap?: boolean;
    children?: React.ReactNode;
  }
  export const Text: React.FC<TextProps>;

  // View
  export interface ViewProps {
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
  export const View: React.FC<ViewProps>;

  // Image
  export interface ImageProps {
    src?: string;
    style?: React.CSSProperties;
    cache?: boolean;
    children?: React.ReactNode;
  }
  export const Image: React.FC<ImageProps>;

  // PDFViewer
  export interface PDFViewerProps {
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
  export const PDFViewer: React.FC<PDFViewerProps>;

  // PDFDownloadLink
  export interface PDFDownloadLinkProps {
    document: React.ReactElement;
    fileName?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: (props: { loading: boolean; error: Error | null; url: string | null }) => React.ReactNode;
  }
  export const PDFDownloadLink: React.FC<PDFDownloadLinkProps>;

  // StyleSheet
  export const StyleSheet: {
    create: <T extends { [key: string]: React.CSSProperties }>(styles: T) => T;
  };
}

declare module 'react-pdf' {
  import * as React from 'react';

  export interface DocumentProps {
    file: string | { url: string } | { data: ArrayBuffer | Uint8Array } | { range: Uint8Array };
    onLoadSuccess?: (pdf: any) => void;
    onLoadError?: (error: Error) => void;
    onLoadProgress?: (progress: { loaded: number; total: number }) => void;
    onSourceSuccess?: (source: any) => void;
    onSourceError?: (error: Error) => void;
    onPassword?: (callback: (password: string) => void) => void;
    options?: any;
    renderMode?: 'canvas' | 'svg';
    rotate?: number;
    children?: React.ReactNode;
  }
  export const Document: React.FC<DocumentProps>;

  export interface PageProps {
    pageNumber: number;
    width?: number;
    height?: number;
    scale?: number;
    rotate?: number;
    canvasRef?: React.RefObject<HTMLCanvasElement>;
    onRenderSuccess?: (page: any) => void;
    onRenderError?: (error: Error) => void;
    onGetTextSuccess?: (textContent: any) => void;
    onGetTextError?: (error: Error) => void;
    onGetAnnotationsSuccess?: (annotations: any) => void;
    onGetAnnotationsError?: (error: Error) => void;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
    renderInteractiveForms?: boolean;
    customTextRenderer?: (text: string, itemIndex: number) => string | null;
    children?: React.ReactNode;
  }
  export const Page: React.FC<PageProps>;

  export interface OutlineProps {
    onItemClick?: ({ pageNumber }: { pageNumber: number }) => void;
    onLoadSuccess?: (outline: any) => void;
    onLoadError?: (error: Error) => void;
    children?: React.ReactNode;
  }
  export const Outline: React.FC<OutlineProps>;

  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  };
}
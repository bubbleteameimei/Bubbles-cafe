import * as React from "react";

// Toast variants types
export type ToastVariant = "default" | "destructive" | "success";

// Toast interface
export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number; // Duration in milliseconds
}

// Toast input without id
export type ToastInput = Omit<Toast, "id"> & {
  variant?: ToastVariant;
};

// Toast actions types
type ToastActionType = 
  | { type: "ADD_TOAST"; toast: ToastInput }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "DISMISS_ALL" };

// Toast context state
interface ToastState {
  toasts: Toast[];
}

// Maximum number of toasts
const TOAST_LIMIT = 3;

// Generate unique ID for toast
let count = 0;
function generateId() {
  return (count++).toString();
}

// Toast reducer
const toastReducer = (state: ToastState, action: ToastActionType): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      // Only allow up to TOAST_LIMIT toasts
      return {
        ...state,
        toasts: [
          { id: generateId(), ...action.toast },
          ...state.toasts,
        ].slice(0, TOAST_LIMIT),
      };

    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    
    case "DISMISS_ALL":
      return {
        ...state,
        toasts: [],
      };

    default:
      return state;
  }
};

// Initial state
const initialState: ToastState = {
  toasts: [],
};

// UseToast hook
export function useToast() {
  const [state, dispatch] = React.useReducer(toastReducer, initialState);

  // Create a toast with a specific variant
  const createToast = React.useCallback(
    (props: ToastInput) => {
      dispatch({ type: "ADD_TOAST", toast: props });
    },
    [dispatch]
  );

  // Dismiss a specific toast
  const dismiss = React.useCallback(
    (id: string) => {
      dispatch({ type: "DISMISS_TOAST", id });
    },
    [dispatch]
  );

  // Dismiss all toasts
  const dismissAll = React.useCallback(() => {
    dispatch({ type: "DISMISS_ALL" });
  }, [dispatch]);

  return {
    toasts: state.toasts,
    toast: createToast,
    dismiss,
    dismissAll,
  };
}
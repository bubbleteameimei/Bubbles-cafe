
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Toaster() {
  const { toasts } = useToast();

  // Map custom toasts to react-toastify
  React.useEffect(() => {
    toasts.forEach(({ id, title, description, variant }) => {
      const toastContent = (
        <div>
          {title && <div className="font-semibold">{title}</div>}
          {description && <div>{description}</div>}
        </div>
      );
      
      // Use the correct toast type based on variant
      const toastOptions = {
        toastId: id,
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      };

      // Cast variant to string to safely handle comparison
      const variantStr = String(variant || 'default');
      
      if (variantStr === 'destructive') {
        toast.error(toastContent, toastOptions);
      } else if (variantStr === 'success') {
        toast.success(toastContent, toastOptions);
      } else {
        // Default case for any other variant
        toast.info(toastContent, toastOptions);
      }
    });
  }, [toasts]);

  return (
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      className="bottom-32"
      style={{ bottom: '160px' }}
    />
  );
}

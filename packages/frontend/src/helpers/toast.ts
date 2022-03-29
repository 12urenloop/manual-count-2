import { Options as ToastOptions, toast as baseToast } from "bulma-toast";

export const toast = (options: ToastOptions) =>
  baseToast({
    animate: { in: "slideInRight", out: "slideOutRight" },
    position: "bottom-right",
    dismissible: true,
    duration: 3000,
    opacity: 0.8,
    ...options,
  });

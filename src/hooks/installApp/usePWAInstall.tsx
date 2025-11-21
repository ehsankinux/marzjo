import { useEffect, useState } from "react";

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = () => {
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then(() => setPromptEvent(null));
    }
  };

  return { installApp, canInstall: !!promptEvent };
}

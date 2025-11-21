import { useEffect, useState, type ReactElement } from "react";

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

export default function InstallButton(): ReactElement {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    function beforeInstallHandler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as DeferredPrompt);
    }

    function installedHandler() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    } catch (err) {
      setDeferredPrompt(null);
    }
  }

  if (isInstalled) {
    return (
      <div>
        <strong>App installed</strong>
      </div>
    );
  }

  if (!deferredPrompt) {
    return <div>Install option will appear when supported by your browser</div>;
  }

  return (
    <button onClick={handleInstall} style={{ padding: "8px 12px", fontSize: "16px" }}>
      Install App
    </button>
  );
}

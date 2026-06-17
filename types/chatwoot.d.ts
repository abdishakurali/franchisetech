interface Window {
  chatwootSettings?: {
    position?: string;
    type?: string;
    hideMessageBubble?: boolean;
    [key: string]: unknown;
  };
  chatwootSDK?: {
    run: (opts: { websiteToken: string; baseUrl: string }) => void;
  };
  $chatwoot?: {
    setUser: (id: string, opts: Record<string, unknown>) => void;
    reset: () => void;
    toggle: (state?: string) => void;
  };
}

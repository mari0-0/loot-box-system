export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-1100 flex flex-col gap-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-6 py-4 bg-bg-card border-4 shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3),6px_6px_0_rgba(0,0,0,0.5)] animate-fade-in-up text-[0.65rem] leading-relaxed max-w-xs flex items-center justify-between gap-4 ${
            toast.type === "success"
              ? "border-accent-success"
              : toast.type === "error"
                ? "border-accent-danger"
                : "border-accent-primary"
          }`}
        >
          <span>{toast.message}</span>
          {toast.link && (
            <a
              href={toast.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-accent-primary text-text-primary! px-3 py-2 border-2 border-text-primary no-underline text-[0.65rem] whitespace-nowrap shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),2px_2px_0_rgba(0,0,0,0.4)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3),3px_3px_0_rgba(0,0,0,0.4)]"
            >
              <span>🔗</span>
              <span>View</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

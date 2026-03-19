import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[2px]" />
      <div className={`relative w-full ${maxWidth} bg-[var(--surface-elevated)] rounded-2xl shadow-xl border border-[var(--border-soft)] animate-modal-in`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-soft)]">
          <h2 className="font-heading text-lg font-semibold text-stone-900">{title}</h2>
          <button onClick={onClose} className="p-2.5 -mr-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

import { LoaderCircle, Inbox } from 'lucide-react';

export function LoadingCard({ title, body }) {
  return (
    <div className="state-panel page-shell gap-4 text-left">
      <div className="state-icon">
        <LoaderCircle className="animate-spin" size={20} />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="page-subtitle !mt-2">{body}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, body }) {
  return (
    <div className="state-panel page-shell gap-4 text-left">
      <div className="state-icon">
        <Inbox size={20} />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="page-subtitle !mt-2">{body}</p>
      </div>
    </div>
  );
}
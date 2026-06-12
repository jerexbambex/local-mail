import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CheckSquare, Mail, MailOpen, Paperclip, Square } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Email {
    id: string;
    from: string;
    subject: string;
    text_body: string;
    created_at: string;
    read_at: string | null;
    attachments_count: number;
}

interface EmailListProps {
    searchQuery: string;
    selectedEmailId: string | null;
    onSelectEmail: (id: string) => void;
    onCountsChange?: (counts: { total: number; unread: number }) => void;
    selectionMode?: boolean;
    selectedEmailIds?: string[];
    onToggleSelected?: (id: string) => void;
    onVisibleEmailIdsChange?: (ids: string[]) => void;
}

export function EmailList({
    searchQuery,
    selectedEmailId,
    onSelectEmail,
    onCountsChange,
    selectionMode = false,
    selectedEmailIds = [],
    onToggleSelected,
    onVisibleEmailIdsChange,
}: EmailListProps) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmails = async () => {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`/api/emails?${params}`);
            const data = await response.json();
            const nextEmails = data.data ?? [];

            setEmails(nextEmails);
            setLoading(false);
            onVisibleEmailIdsChange?.(nextEmails.map((email: Email) => email.id));
            onCountsChange?.({
                total: data.total ?? nextEmails.length,
                unread: nextEmails.filter((email: Email) => !email.read_at).length,
            });
        };

        fetchEmails();
        const interval = setInterval(fetchEmails, 5000);

        return () => clearInterval(interval);
    }, [onCountsChange, onVisibleEmailIdsChange, searchQuery]);

    if (loading) {
        return (
            <div className="grid gap-3 p-4 pt-0">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="rounded-lg border p-4">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="mt-3 h-3 w-1/2" />
                        <Skeleton className="mt-4 h-3 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {emails.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                        <Mail className="mx-auto h-8 w-8 opacity-30" />
                        <div className="mt-3 text-sm font-medium text-foreground">No emails found</div>
                        <p className="mt-1 text-xs">Messages sent to the local SMTP server will appear here.</p>
                    </div>
                ) : (
                    emails.map((email) => {
                        const unread = !email.read_at;
                        const selected = selectedEmailIds.includes(email.id);

                        return (
                            <button
                                key={email.id}
                                onClick={() => {
                                    if (selectionMode) {
                                        onToggleSelected?.(email.id);
                                        return;
                                    }

                                    onSelectEmail(email.id);
                                }}
                                className={cn(
                                    'group grid gap-3 rounded-lg border p-4 text-left text-sm transition-colors',
                                    selected || selectedEmailId === email.id
                                        ? 'border-primary/25 bg-primary/10'
                                        : 'border-transparent bg-transparent hover:border-border hover:bg-muted/60',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {selectionMode && (
                                        <span className="mt-1 text-muted-foreground">
                                            {selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                                        </span>
                                    )}
                                    <div
                                        className={cn(
                                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border',
                                            unread
                                                ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300'
                                                : 'bg-background text-muted-foreground',
                                        )}
                                    >
                                        {unread ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="truncate font-semibold text-foreground">{email.from}</div>
                                            {unread && <span className="size-2 rounded-full bg-sky-500" />}
                                        </div>
                                        <div className="mt-1 truncate text-xs font-medium text-foreground">{email.subject || '(No subject)'}</div>
                                    </div>
                                    <div className="shrink-0 text-xs text-muted-foreground">{formatEmailDate(email.created_at)}</div>
                                </div>

                                <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                    {email.text_body || 'No plain text body available.'}
                                </div>

                                {email.attachments_count > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="h-6 gap-1 rounded-md px-2 font-normal">
                                            <Paperclip className="h-3 w-3" />
                                            {email.attachments_count} attachment
                                            {email.attachments_count === 1 ? '' : 's'}
                                        </Badge>
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </ScrollArea>
    );
}

function formatEmailDate(value: string) {
    const date = new Date(value);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
}

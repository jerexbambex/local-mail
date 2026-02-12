import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Mail, Paperclip } from 'lucide-react';

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
}

export function EmailList({ searchQuery, selectedEmailId, onSelectEmail }: EmailListProps) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmails = async () => {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            
            const response = await fetch(`/api/emails?${params}`);
            const data = await response.json();
            setEmails(data.data);
            setLoading(false);
        };

        fetchEmails();
        const interval = setInterval(fetchEmails, 5000);
        return () => clearInterval(interval);
    }, [searchQuery]);

    if (loading) {
        return <div className="w-full md:w-96 border-r p-4">Loading...</div>;
    }

    return (
        <div className="w-full md:w-96 border-r overflow-y-auto">
            <div className="divide-y">
                {emails.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No emails yet
                    </div>
                ) : (
                    emails.map((email) => (
                        <button
                            key={email.id}
                            onClick={() => onSelectEmail(email.id)}
                            className={cn(
                                'w-full p-4 text-left transition-colors hover:bg-muted',
                                selectedEmailId === email.id && 'bg-muted',
                                !email.read_at && 'font-semibold'
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span className="truncate text-sm">{email.from}</span>
                                </div>
                                {email.attachments_count > 0 && (
                                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                            </div>
                            <div className="mt-1 truncate text-sm">{email.subject || '(No Subject)'}</div>
                            <div className="mt-1 truncate text-xs text-muted-foreground">
                                {email.text_body?.substring(0, 100)}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {new Date(email.created_at).toLocaleString()}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

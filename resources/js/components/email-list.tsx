import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Mail, Paperclip } from 'lucide-react';
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
        return (
            <div className="flex h-full items-center justify-center p-4">
                <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {emails.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No emails found
                    </div>
                ) : (
                    emails.map((email) => (
                        <button
                            key={email.id}
                            onClick={() => onSelectEmail(email.id)}
                            className={cn(
                                'flex flex-col items-start gap-2 rounded-xl border p-4 text-left text-sm transition-all hover:bg-white/5 hover:border-white/10',
                                selectedEmailId === email.id
                                    ? 'bg-white/10 border-white/20 shadow-lg'
                                    : 'border-transparent bg-transparent'
                            )}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold text-foreground">
                                            {email.from}
                                        </div>
                                        {!email.read_at && (
                                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">
                                        {new Date(email.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-foreground">
                                    {email.subject || '(No Subject)'}
                                </div>
                            </div>
                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                {email.text_body?.substring(0, 300)}
                            </div>
                            {email.attachments_count > 0 && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="px-1 font-normal">
                                        <Paperclip className="mr-1 h-3 w-3" />
                                        Attachment
                                    </Badge>
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </ScrollArea>
    );
}

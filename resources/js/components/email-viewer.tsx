import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Trash2, FileText, ArrowLeft } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Email {
    id: string;
    from: string;
    to: string[];
    cc: string[] | null;
    subject: string;
    html_body: string;
    text_body: string;
    created_at: string;
    attachments: Attachment[];
}

interface Attachment {
    id: string;
    filename: string;
    content_type: string;
    size: number;
}

interface EmailViewerProps {
    emailId: string | null;
    onEmailDeleted: () => void;
    onBack?: () => void;
}

export function EmailViewer({ emailId, onEmailDeleted, onBack }: EmailViewerProps) {
    const [email, setEmail] = useState<Email | null>(null);
    const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (!emailId) {
            setEmail(null);
            return;
        }

        const fetchEmail = async () => {
            setLoading(true);
            const response = await fetch(`/api/emails/${emailId}`);
            const data = await response.json();
            setEmail(data);
            setLoading(false);
        };

        fetchEmail();
    }, [emailId]);

    const handleDelete = async () => {
        if (!email) return;
        
        await fetch(`/api/emails/${email.id}`, { 
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            }
        });
        setShowDeleteDialog(false);
        onEmailDeleted();
    };

    const handleViewSource = async () => {
        if (!email) return;
        const response = await fetch(`/api/emails/${email.id}/source`);
        const data = await response.json();
        const blob = new Blob([data.source], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    if (!emailId) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-2xl space-y-6 text-center">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">SMTP Server Ready</h2>
                        <p className="text-muted-foreground">
                            Configure your application to send emails to this server
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-6 text-left space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">SMTP Configuration</h3>
                            <div className="space-y-1 text-sm font-mono">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Host:</span>
                                    <span>127.0.0.1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Port:</span>
                                    <span>1025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Encryption:</span>
                                    <span>None</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Authentication:</span>
                                    <span>None</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold mb-2">Laravel Example</h3>
                            <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_ENCRYPTION=null`}</pre>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            💡 Make sure the SMTP server is running: <code className="bg-background px-1 py-0.5 rounded">php artisan smtp:serve</code>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Select an email from the list to view its contents
                    </p>
                </div>
            </div>
        );
    }

    if (loading || !email) {
        return (
            <div className="flex flex-1 items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-1 flex-col overflow-hidden w-full">
                <div className="border-b p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {onBack && (
                                <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden shrink-0">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <h2 className="text-lg md:text-xl font-semibold truncate">{email.subject || '(No Subject)'}</h2>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={handleViewSource}>
                                <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1 text-sm">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-12 shrink-0">From:</span>
                            <span className="truncate">{email.from}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-12 shrink-0">To:</span>
                            <span className="truncate">{email.to.join(', ')}</span>
                        </div>
                        {email.cc && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground w-12 shrink-0">CC:</span>
                                <span className="truncate">{email.cc.join(', ')}</span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-12 shrink-0">Date:</span>
                            <span className="text-xs md:text-sm">{new Date(email.created_at).toLocaleString()}</span>
                        </div>
                    </div>

                    {email.attachments.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Attachments ({email.attachments.length})</div>
                                <div className="flex flex-wrap gap-2">
                                    {email.attachments.map((attachment) => (
                                        <a
                                            key={attachment.id}
                                            href={`/api/emails/${email.id}/attachments/${attachment.id}`}
                                            className="flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-muted"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="truncate max-w-[150px] md:max-w-[200px]">{attachment.filename}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({(attachment.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'html' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('html')}
                        >
                            HTML
                        </Button>
                        <Button
                            variant={viewMode === 'text' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('text')}
                        >
                            Text
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-white">
                    {viewMode === 'html' ? (
                        email.html_body ? (
                            <iframe
                                srcDoc={email.html_body}
                                className="w-full h-full border-0"
                                sandbox="allow-same-origin allow-popups"
                                title="Email content"
                            />
                        ) : (
                            <div className="h-full overflow-y-auto p-4">
                                <pre className="whitespace-pre-wrap font-mono text-sm text-black">{email.text_body}</pre>
                            </div>
                        )
                    ) : (
                        <div className="h-full overflow-y-auto p-4">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-black">{email.text_body}</pre>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Email</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this email? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

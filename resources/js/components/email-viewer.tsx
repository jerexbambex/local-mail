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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Code, Download, FileText, Mail, Monitor, Paperclip, Smartphone, Tablet, Trash2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { EmailAnalysis } from './email-analysis';
import { HeadersView } from './headers-view';
import { cn } from '@/lib/utils';

interface Email {
    id: string;
    from: string;
    to: string[];
    cc: string[] | null;
    bcc: string[] | null;
    subject: string | null;
    html_body: string | null;
    text_body: string | null;
    raw_message: string;
    size: number;
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
    const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
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
        if (!email) {
            return;
        }

        await fetch(`/api/emails/${email.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
        setShowDeleteDialog(false);
        onEmailDeleted();
    };

    const handleMarkUnread = async () => {
        if (!email) {
            return;
        }

        await fetch(`/api/emails/${email.id}/unread`, {
            method: 'PUT',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
        onEmailDeleted();
    };

    const handleDownload = () => {
        if (!email) {
            return;
        }

        window.open(`/api/emails/${email.id}/download`, '_blank');
    };

    if (!emailId) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-muted/10 p-8 text-center text-muted-foreground">
                <div className="flex size-14 items-center justify-center rounded-xl border bg-background">
                    <Mail className="h-6 w-6 opacity-50" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">No email selected</h3>
                <p className="mt-2 max-w-xs text-sm">
                    Select a message to inspect its rendered HTML, source, headers, links, spam signals, and attachments.
                </p>
            </div>
        );
    }

    if (loading || !email) {
        return (
            <div className="grid h-full grid-rows-[auto_1fr]">
                <div className="border-b p-5">
                    <Skeleton className="h-6 w-72" />
                    <Skeleton className="mt-3 h-4 w-96" />
                </div>
                <div className="p-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="mt-5 h-96 w-full" />
                </div>
            </div>
        );
    }

    const subject = email.subject || '(No subject)';
    const htmlBody = email.html_body || '';
    const textBody = email.text_body || '';
    const linkCount = countLinks(htmlBody);
    const initials = getInitials(email.from);

    return (
        <div className="flex h-full min-w-0 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <Avatar className="size-9">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{subject}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>Sent {formatFullDate(email.created_at)}</span>
                            <span>Size {formatBytes(email.size)}</span>
                            <Badge variant="secondary" className="h-5 rounded-md bg-green-500/10 px-2 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                {linkCount === 0 ? 'No links' : `${linkCount} links found`}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden gap-2 sm:flex" onClick={handleMarkUnread}>
                        <Mail className="h-4 w-4" />
                        Unread
                    </Button>
                    <Button variant="outline" size="sm" className="hidden gap-2 sm:flex" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                        .eml
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-5 p-4 lg:p-5">
                    <section className="rounded-lg border bg-background">
                        <MetaRow label="From" value={email.from} />
                        <MetaRow label="To" value={email.to.join(', ')} />
                        {email.cc && email.cc.length > 0 && <MetaRow label="CC" value={email.cc.join(', ')} />}
                        {email.bcc && email.bcc.length > 0 && <MetaRow label="BCC" value={email.bcc.join(', ')} />}
                        <MetaRow label="Message ID" value={extractMessageId(email.raw_message) || email.id} mono />
                        <div className="grid gap-2 border-t p-4 text-sm md:grid-cols-[140px_1fr]">
                            <div className="text-muted-foreground">Attachments</div>
                            <div className="min-w-0">
                                {email.attachments.length === 0 ? (
                                    <span className="text-muted-foreground">None</span>
                                ) : (
                                    <div className="grid gap-2">
                                        {email.attachments.map((attachment) => (
                                            <a
                                                key={attachment.id}
                                                href={`/api/emails/${email.id}/attachments/${attachment.id}`}
                                                className="flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted"
                                            >
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate">{attachment.filename}</span>
                                                </span>
                                                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(attachment.size)}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <Tabs defaultValue="html" className="w-full">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <TabsList className="h-auto flex-wrap justify-start rounded-md bg-muted/60 p-1">
                                <TabsTrigger value="html">HTML</TabsTrigger>
                                <TabsTrigger value="source">HTML Source</TabsTrigger>
                                <TabsTrigger value="text">Text</TabsTrigger>
                                <TabsTrigger value="raw">Raw</TabsTrigger>
                                <TabsTrigger value="debug">Debug</TabsTrigger>
                                <TabsTrigger value="headers">Headers</TabsTrigger>
                                <TabsTrigger value="links">Links</TabsTrigger>
                                <TabsTrigger value="spam">Spam Report</TabsTrigger>
                                <TabsTrigger value="testing">Testing</TabsTrigger>
                            </TabsList>

                            <div className="flex w-fit items-center rounded-md border bg-background p-1">
                                <DeviceButton
                                    active={deviceView === 'desktop'}
                                    label="Desktop"
                                    icon={Monitor}
                                    onClick={() => setDeviceView('desktop')}
                                />
                                <DeviceButton active={deviceView === 'tablet'} label="Tablet" icon={Tablet} onClick={() => setDeviceView('tablet')} />
                                <DeviceButton
                                    active={deviceView === 'mobile'}
                                    label="Mobile"
                                    icon={Smartphone}
                                    onClick={() => setDeviceView('mobile')}
                                />
                            </div>
                        </div>

                        <TabsContent value="html" className="mt-4">
                            <div
                                className={cn(
                                    'transition-all',
                                    deviceView === 'desktop' ? 'w-full' : 'flex justify-center overflow-auto rounded-lg border bg-zinc-950 p-6',
                                )}
                            >
                                <div
                                    className={cn(
                                        'overflow-hidden bg-white',
                                        deviceView === 'desktop' ? 'min-h-[620px] w-full rounded-lg border' : 'rounded-lg shadow-2xl',
                                        deviceView === 'tablet' && 'h-[900px] w-[768px]',
                                        deviceView === 'mobile' && 'h-[720px] w-[390px]',
                                    )}
                                >
                                    {htmlBody ? (
                                        <iframe
                                            srcDoc={htmlBody}
                                            className="block h-full w-full border-0"
                                            sandbox="allow-same-origin allow-popups"
                                            title="Email content"
                                            onLoad={(event) => {
                                                const iframe = event.currentTarget;

                                                if (deviceView !== 'desktop') {
                                                    iframe.style.height = '100%';
                                                    return;
                                                }

                                                try {
                                                    setTimeout(() => {
                                                        const height = iframe.contentWindow?.document.documentElement.scrollHeight;

                                                        if (height) {
                                                            iframe.style.height = `${Math.max(height, 620)}px`;
                                                        }
                                                    }, 100);
                                                } catch {
                                                    iframe.style.height = '620px';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <pre className="h-full overflow-auto p-5 font-mono text-sm whitespace-pre-wrap text-zinc-900">
                                            {textBody || '(No body)'}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <CodeTab value="source" icon={Code} content={htmlBody || '(No HTML body)'} />
                        <CodeTab value="text" icon={FileText} content={textBody || '(No text body)'} />
                        <CodeTab value="raw" icon={FileText} content={email.raw_message} />

                        <TabsContent value="debug" className="mt-4">
                            <Card className="h-[620px] rounded-lg">
                                <EmailAnalysis html={htmlBody} text={textBody} defaultTab="health" />
                            </Card>
                        </TabsContent>

                        <TabsContent value="headers" className="mt-4">
                            <div className="rounded-lg border bg-background p-4">
                                <HeadersView email={email} />
                            </div>
                        </TabsContent>

                        <TabsContent value="links" className="mt-4">
                            <Card className="h-[620px] rounded-lg">
                                <EmailAnalysis html={htmlBody} text={textBody} defaultTab="links" />
                            </Card>
                        </TabsContent>

                        <TabsContent value="spam" className="mt-4">
                            <Card className="h-[620px] rounded-lg">
                                <EmailAnalysis html={htmlBody} text={textBody} defaultTab="spam" />
                            </Card>
                        </TabsContent>

                        <TabsContent value="testing" className="mt-4">
                            <Card className="h-[620px] rounded-lg">
                                <EmailAnalysis html={htmlBody} text={textBody} defaultTab="testing" />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete email</AlertDialogTitle>
                        <AlertDialogDescription>This removes the message and any saved attachments from the local mailbox.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="text-destructive-foreground bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="grid gap-2 border-t p-4 text-sm first:border-t-0 md:grid-cols-[140px_1fr]">
            <div className="text-muted-foreground">{label}</div>
            <div className={cn('min-w-0 truncate text-foreground', mono && 'font-mono text-xs')}>{value}</div>
        </div>
    );
}

function DeviceButton({
    active,
    label,
    icon: Icon,
    onClick,
}: {
    active: boolean;
    label: string;
    icon: ComponentType<{ className?: string }>;
    onClick: () => void;
}) {
    return (
        <Button
            variant="ghost"
            size="sm"
            aria-label={label}
            className={cn('h-8 gap-2 px-2', active && 'bg-muted text-foreground shadow-sm')}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{label}</span>
        </Button>
    );
}

function CodeTab({ value, icon: Icon, content }: { value: string; icon: ComponentType<{ className?: string }>; content: string }) {
    return (
        <TabsContent value={value} className="mt-4">
            <Card className="rounded-lg p-0">
                <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {value === 'source' ? 'HTML source' : value}
                </div>
                <ScrollArea className="h-[560px]">
                    <pre className="p-4 font-mono text-xs whitespace-pre-wrap">{content}</pre>
                </ScrollArea>
            </Card>
        </TabsContent>
    );
}

function countLinks(html: string): number {
    if (!html) {
        return 0;
    }

    return new DOMParser().parseFromString(html, 'text/html').querySelectorAll('a').length;
}

function extractMessageId(rawMessage: string): string | null {
    return rawMessage.match(/^Message-ID:\s*(.+)$/im)?.[1]?.trim() ?? null;
}

function getInitials(value: string): string {
    return value
        .split(/[ <@.]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatFullDate(value: string): string {
    return new Date(value).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function formatBytes(bytes: number): string {
    if (!bytes) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

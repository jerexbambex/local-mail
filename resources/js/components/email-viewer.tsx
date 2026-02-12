import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Trash2, Smartphone, Monitor, Tablet, Code, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmailAnalysis } from './email-analysis';
import { useEffect, useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeadersView } from './headers-view';
import { cn } from '@/lib/utils';

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
    const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Derived state
    const initials = email?.from
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

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

    const handleMarkUnread = async () => {
        if (!email) return;
        await fetch(`/api/emails/${email.id}/unread`, {
            method: 'PUT',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            }
        });
        // We'll treat this as a 'delete' in terms of UI flow to clear selection,
        // or we could just refresh. For now, let's refresh the list via callback.
        onEmailDeleted(); // HACK: reusing this to trigger list refresh
    };

    const handleDownload = () => {
        if (!email) return;
        window.open(`/api/emails/${email.id}/download`, '_blank');
    };

    if (!emailId) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20">
                <MailIcon className="h-12 w-12 opacity-20 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No email selected</h3>
                <p className="text-sm max-w-xs mx-auto mt-2">
                    Select an email from the left to view its contents.
                </p>
            </div>
        );
    }

    if (loading || !email) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
                Loading email details...
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b p-2">
                <div className="flex items-center gap-2">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleMarkUnread}>
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark as Unread</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleDownload}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download .eml</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    <div className="flex items-center bg-muted rounded-lg p-0.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-7 w-7", deviceView === 'desktop' && "bg-background shadow-sm")}
                                        onClick={() => setDeviceView('desktop')}
                                    >
                                        <Monitor className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Desktop</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-7 w-7", deviceView === 'tablet' && "bg-background shadow-sm")}
                                        onClick={() => setDeviceView('tablet')}
                                    >
                                        <Tablet className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Tablet</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-7 w-7", deviceView === 'mobile' && "bg-background shadow-sm")}
                                        onClick={() => setDeviceView('mobile')}
                                    >
                                        <Smartphone className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mobile</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-semibold leading-tight mb-1">{email.subject || '(No Subject)'}</h2>
                            <div className="flex items-baseline justify-between gap-4">
                                <div className="text-sm">
                                    <span className="font-semibold text-foreground">{email.from}</span>
                                    <span className="text-muted-foreground ml-2">to {email.to.join(', ')}</span>
                                    {email.cc && email.cc.length > 0 && (
                                        <span className="text-muted-foreground ml-1">cc {email.cc.join(', ')}</span>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(email.created_at).toLocaleString([], {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-6" />

                    {/* Attachments */}
                    {email.attachments.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-3">Attachments ({email.attachments.length})</h4>
                            <div className="flex flex-wrap gap-2">
                                {email.attachments.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={`/api/emails/${email.id}/attachments/${attachment.id}`}
                                        className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
                                    >
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        <span className="max-w-[150px] truncate">{attachment.filename}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({(attachment.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </a>
                                ))}
                            </div>
                            <Separator className="mt-6" />
                        </div>
                    )}

                    <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="flex w-full justify-start overflow-auto mb-4 border-b rounded-none bg-transparent p-0">
                            <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">HTML</TabsTrigger>
                            <TabsTrigger value="source" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">HTML Source</TabsTrigger>
                            <TabsTrigger value="text" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Text</TabsTrigger>
                            <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Headers</TabsTrigger>
                            <TabsTrigger value="raw" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Raw</TabsTrigger>
                            <TabsTrigger value="analysis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Link Check</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="preview"
                            className={cn(
                                "min-h-[500px] transition-all",
                                deviceView !== 'desktop' && "flex justify-center bg-black/20 rounded-xl border border-white/5 p-8 backdrop-blur-sm",
                                deviceView === 'desktop' && "w-full p-0 mt-4"
                            )}
                        >
                            <div
                                className={cn(
                                    "transition-all duration-300 ease-in-out bg-white overflow-hidden",
                                    deviceView === 'desktop' ? "w-full min-h-[600px] rounded-lg border border-border/50" :
                                        "shadow-2xl rounded-lg ring-1 ring-white/10",
                                    deviceView === 'tablet' && "w-[768px] h-[1024px]",
                                    deviceView === 'mobile' && "w-[375px] h-[667px]"
                                )}
                            >
                                {email.html_body ? (
                                    <iframe
                                        srcDoc={email.html_body}
                                        className="w-full h-full border-0 block"
                                        sandbox="allow-same-origin allow-popups"
                                        title="Email content"
                                        onLoad={(e) => {
                                            const iframe = e.currentTarget;
                                            if (deviceView === 'desktop') {
                                                try {
                                                    // Give it a moment to render
                                                    setTimeout(() => {
                                                        const height = iframe.contentWindow?.document.documentElement.scrollHeight;
                                                        if (height) {
                                                            iframe.style.height = `${Math.max(height, 600)}px`;
                                                        }
                                                    }, 100);
                                                } catch (error) {
                                                    console.error("Failed to resize iframe:", error);
                                                }
                                            } else {
                                                iframe.style.height = '100%';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="p-4 h-full overflow-auto">
                                        <pre className="whitespace-pre-wrap font-mono text-sm">{email.text_body}</pre>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="source" className="mt-0">
                            <Card className="rounded-md border p-0 overflow-hidden bg-muted/30">
                                <ScrollArea className="h-[600px] p-4 font-mono text-xs">
                                    <pre className="whitespace-pre-wrap">{email.html_body || '(No HTML Body)'}</pre>
                                </ScrollArea>
                            </Card>
                        </TabsContent>

                        <TabsContent value="text" className="mt-0">
                            <Card className="rounded-md border p-0 overflow-hidden bg-muted/30">
                                <ScrollArea className="h-[600px] p-4 font-mono text-sm whitespace-pre-wrap">
                                    {email.text_body || '(No Text Body)'}
                                </ScrollArea>
                            </Card>
                        </TabsContent>

                        <TabsContent value="headers" className="mt-0">
                            <div className="rounded-md border p-4 bg-background">
                                <HeadersView email={email} />
                            </div>
                        </TabsContent>

                        <TabsContent value="raw" className="mt-0">
                            <Card className="rounded-md border p-0 overflow-hidden bg-muted/30">
                                <ScrollArea className="h-[600px] p-4 font-mono text-xs">
                                    <pre className="whitespace-pre-wrap">{email.raw_message}</pre>
                                </ScrollArea>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analysis" className="mt-0">
                            <Card className="rounded-md border bg-background h-[600px]">
                                <EmailAnalysis html={email.html_body} text={email.text_body} />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>

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
        </div>
    );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    )
}

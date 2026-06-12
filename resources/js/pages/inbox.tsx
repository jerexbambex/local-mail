import { EmailList } from '@/components/email-list';
import { EmailViewer } from '@/components/email-viewer';
import { ModeToggle } from '@/components/mode-toggle';
import { SearchBar } from '@/components/search-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Head, Link } from '@inertiajs/react';
import { Activity, CheckSquare, Inbox as InboxIcon, Mail, MailOpen, Server, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

export default function Inbox() {
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [counts, setCounts] = useState({ total: 0, unread: 0 });
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
    const [visibleEmailIds, setVisibleEmailIds] = useState<string[]>([]);

    const refreshMailbox = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    const handleEmailDeleted = () => {
        setSelectedEmail(null);
        setSelectedEmailIds([]);
        setSelectionMode(false);
        refreshMailbox();
    };

    const handleClearAll = () => {
        setSelectedEmail(null);
        setSelectedEmailIds([]);
        setSelectionMode(false);
        refreshMailbox();
    };

    const handleCountsChange = useCallback((nextCounts: { total: number; unread: number }) => {
        setCounts(nextCounts);
    }, []);

    const handleVisibleEmailIdsChange = useCallback((ids: string[]) => {
        setVisibleEmailIds(ids);
        setSelectedEmailIds((current) => current.filter((id) => ids.includes(id)));
    }, []);

    const toggleSelectionMode = () => {
        setSelectionMode((value) => !value);
        setSelectedEmailIds([]);
    };

    const toggleSelectedEmail = (id: string) => {
        setSelectedEmailIds((current) => (current.includes(id) ? current.filter((emailId) => emailId !== id) : [...current, id]));
    };

    const selectVisibleEmails = () => {
        setSelectionMode(true);
        setSelectedEmailIds(visibleEmailIds);
    };

    const performBulkAction = async (endpoint: string) => {
        if (selectedEmailIds.length === 0) {
            return;
        }

        await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ ids: selectedEmailIds }),
        });

        if (endpoint.endsWith('bulk-delete') && selectedEmail && selectedEmailIds.includes(selectedEmail)) {
            setSelectedEmail(null);
        }

        setSelectedEmailIds([]);
        setSelectionMode(false);
        refreshMailbox();
    };

    return (
        <div className="flex h-screen flex-col bg-background text-foreground">
            <Head title="Local Mailbox" />

            <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b px-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
                        <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            <Mail className="size-4" />
                        </div>
                        <span className="hidden sm:inline">Local SMTP</span>
                    </Link>
                    <Separator orientation="vertical" className="hidden h-5 sm:block" />
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">Local mailbox</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-green-500" />
                                Listening on 127.0.0.1:1025
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="hidden h-8 gap-1 rounded-md px-3 sm:flex">
                        <InboxIcon className="h-3.5 w-3.5" />
                        {counts.total} total
                    </Badge>
                    <Badge variant="secondary" className="hidden h-8 gap-1 rounded-md px-3 sm:flex">
                        <Activity className="h-3.5 w-3.5" />
                        {counts.unread} unread
                    </Badge>
                    <ModeToggle />
                </div>
            </header>

            <div className="grid min-h-0 flex-1 md:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]">
                <aside className={`${selectedEmail ? 'hidden md:flex' : 'flex'} min-w-0 flex-col border-r bg-muted/20`}>
                    <div className="border-b p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h1 className="text-base font-semibold">PHP Package Development</h1>
                                <p className="text-xs text-muted-foreground">Captured application mail</p>
                            </div>
                            <Server className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onClearAll={handleClearAll} onRefresh={refreshMailbox} />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        <span>Messages</span>
                        <div className="flex items-center gap-2">
                            <span>{counts.total}</span>
                            <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs normal-case" onClick={toggleSelectionMode}>
                                <CheckSquare className="h-3.5 w-3.5" />
                                {selectionMode ? 'Cancel' : 'Select'}
                            </Button>
                        </div>
                    </div>

                    {selectionMode && (
                        <div className="mx-4 mb-4 rounded-lg border bg-background p-3">
                            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium">{selectedEmailIds.length} selected</span>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={selectVisibleEmails}>
                                    Select visible
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    disabled={selectedEmailIds.length === 0}
                                    onClick={() => performBulkAction('/api/emails/bulk-unread')}
                                >
                                    <MailOpen className="h-4 w-4" />
                                    Mark unread
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-destructive hover:text-destructive"
                                    disabled={selectedEmailIds.length === 0}
                                    onClick={() => performBulkAction('/api/emails/bulk-delete')}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}

                    <EmailList
                        key={refreshKey}
                        searchQuery={searchQuery}
                        selectedEmailId={selectedEmail}
                        onSelectEmail={setSelectedEmail}
                        onCountsChange={handleCountsChange}
                        selectionMode={selectionMode}
                        selectedEmailIds={selectedEmailIds}
                        onToggleSelected={toggleSelectedEmail}
                        onVisibleEmailIdsChange={handleVisibleEmailIdsChange}
                    />
                </aside>

                <main className={`${selectedEmail ? 'flex' : 'hidden md:flex'} min-w-0 flex-col overflow-hidden`}>
                    <EmailViewer emailId={selectedEmail} onEmailDeleted={handleEmailDeleted} onBack={() => setSelectedEmail(null)} />
                </main>
            </div>
        </div>
    );
}

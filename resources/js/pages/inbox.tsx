import { Utils } from '@/lib/utils';
import { EmailList } from '@/components/email-list';
import { EmailViewer } from '@/components/email-viewer';
import { SearchBar } from '@/components/search-bar';
import { ModeToggle } from '@/components/mode-toggle';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function Inbox() {
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEmailDeleted = () => {
        setSelectedEmail(null);
        setRefreshKey((prev) => prev + 1);
    };

    const handleClearAll = () => {
        setSelectedEmail(null);
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Head title="Inbox" />

            <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 lg:h-[60px]">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Mail className="size-4" />
                        </div>
                        <span>SMTP Server</span>
                    </Link>
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Inbox</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Email List */}
                <div className={`${selectedEmail ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-border bg-muted/10`}>
                    <div className="p-4 border-b">
                        <SearchBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onClearAll={handleClearAll}
                        />
                    </div>
                    <div className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        All Inboxes
                    </div>
                    <EmailList
                        key={refreshKey}
                        searchQuery={searchQuery}
                        selectedEmailId={selectedEmail}
                        onSelectEmail={setSelectedEmail}
                    />
                </div>

                {/* Email Viewer */}
                <div className={`${selectedEmail ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden bg-background`}>
                    <EmailViewer
                        emailId={selectedEmail}
                        onEmailDeleted={handleEmailDeleted}
                        onBack={() => setSelectedEmail(null)}
                    />
                </div>
            </div>
        </div>
    );
}

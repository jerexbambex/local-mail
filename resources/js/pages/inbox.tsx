import { Head } from '@inertiajs/react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { EmailList } from '@/components/email-list';
import { EmailViewer } from '@/components/email-viewer';
import { SearchBar } from '@/components/search-bar';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function Inbox() {
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEmailDeleted = () => {
        setSelectedEmail(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleClearAll = () => {
        setSelectedEmail(null);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <Head title="Inbox" />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <SearchBar 
                            searchQuery={searchQuery} 
                            onSearchChange={setSearchQuery}
                            onClearAll={handleClearAll}
                        />
                    </header>
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        <div className={selectedEmail ? 'hidden md:block' : 'block w-full'}>
                            <EmailList
                                key={refreshKey}
                                searchQuery={searchQuery}
                                selectedEmailId={selectedEmail}
                                onSelectEmail={setSelectedEmail}
                            />
                        </div>
                        <div className={selectedEmail ? 'flex flex-1' : 'hidden md:flex md:flex-1'}>
                            <EmailViewer 
                                emailId={selectedEmail}
                                onEmailDeleted={handleEmailDeleted}
                                onBack={() => setSelectedEmail(null)}
                            />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

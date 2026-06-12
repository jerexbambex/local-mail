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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClearAll: () => void;
    onRefresh: () => void;
}

export function SearchBar({ searchQuery, onSearchChange, onClearAll, onRefresh }: SearchBarProps) {
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleClearAll = async () => {
        await fetch('/api/emails', {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
        setShowClearDialog(false);
        onClearAll();
    };

    return (
        <>
            <div className="grid gap-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search sender, subject, or body"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-10 pl-9"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={onRefresh}>
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-destructive hover:text-destructive"
                        onClick={() => setShowClearDialog(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border bg-background p-2">
                        <div className="text-muted-foreground">SMTP host</div>
                        <code className="mt-1 block truncate text-foreground">127.0.0.1</code>
                    </div>
                    <div className="rounded-md border bg-background p-2">
                        <div className="text-muted-foreground">Port</div>
                        <code className="mt-1 block text-foreground">1025</code>
                    </div>
                </div>
            </div>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all emails</AlertDialogTitle>
                        <AlertDialogDescription>This removes every captured message and attachment from the local mailbox.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll} className="text-destructive-foreground bg-destructive hover:bg-destructive/90">
                            Delete all
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

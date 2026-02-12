import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
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

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClearAll: () => void;
}

export function SearchBar({ searchQuery, onSearchChange, onClearAll }: SearchBarProps) {
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleClearAll = async () => {
        await fetch('/api/emails', { 
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            }
        });
        setShowClearDialog(false);
        onClearAll();
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Input
                    type="search"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="max-w-md"
                />
                <Button variant="outline" size="sm" onClick={() => setShowClearDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                </Button>
            </div>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Emails</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete all emails? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

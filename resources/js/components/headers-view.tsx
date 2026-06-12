import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HeadersViewProps {
    email: {
        id: string;
        created_at: string;
        from: string;
        to: string[];
        cc?: string[] | null;
        subject?: string | null;
        raw_message?: string;
    };
}

export function HeadersView({ email }: HeadersViewProps) {
    const headers = parseHeaders(email.raw_message).length
        ? parseHeaders(email.raw_message)
        : [
              { key: 'Message-ID', value: email.id },
              { key: 'Date', value: email.created_at },
              { key: 'From', value: email.from },
              { key: 'To', value: email.to.join(', ') },
              { key: 'Subject', value: email.subject || '(No subject)' },
              ...(email.cc?.length ? [{ key: 'Cc', value: email.cc.join(', ') }] : []),
          ];

    return (
        <ScrollArea className="h-full max-h-[560px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Header</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {headers.map((header, index) => (
                        <TableRow key={`${header.key}-${index}`}>
                            <TableCell className="font-mono text-xs font-medium">{header.key}</TableCell>
                            <TableCell className="font-mono text-xs break-all">{header.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}

function parseHeaders(rawMessage?: string) {
    if (!rawMessage) {
        return [];
    }

    const headerBlock = rawMessage.split(/\r?\n\r?\n/)[0] ?? '';
    const unfolded = headerBlock.replace(/\r?\n[ \t]+/g, ' ');

    return unfolded
        .split(/\r?\n/)
        .map((line) => {
            const separatorIndex = line.indexOf(':');

            if (separatorIndex === -1) {
                return null;
            }

            return {
                key: line.slice(0, separatorIndex),
                value: line.slice(separatorIndex + 1).trim(),
            };
        })
        .filter((header): header is { key: string; value: string } => Boolean(header));
}

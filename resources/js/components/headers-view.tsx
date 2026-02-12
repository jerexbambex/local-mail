import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface HeadersViewProps {
    email: any;
}

export function HeadersView({ email }: HeadersViewProps) {
    // This is a placeholder as we might need to parse raw headers or if the API returns them
    // Assuming for now we construct some standard ones from the email object if raw aren't available
    // OR we can fetch raw source and parse it.
    // For this redesign, let's assume we want to show the standard fields + any others we can find.

    // In a real scenario, we might want to pass the full raw headers. 
    // Since `email` object structure in `email-viewer` implies specific fields, 
    // we'll visualize those for now, and maybe later add raw header parsing if the backend provides it in a separate field.

    const standardHeaders = [
        { key: "Message-ID", value: email.id }, // Using ID as proxy or if we had it
        { key: "Date", value: email.created_at },
        { key: "From", value: email.from },
        { key: "To", value: email.to.join(", ") },
        { key: "Subject", value: email.subject },
    ];

    if (email.cc) {
        standardHeaders.push({ key: "Cc", value: email.cc.join(", ") });
    }

    return (
        <ScrollArea className="h-full max-h-[500px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Header</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standardHeaders.map((header) => (
                        <TableRow key={header.key}>
                            <TableCell className="font-medium font-mono text-xs">{header.key}</TableCell>
                            <TableCell className="font-mono text-xs break-all">{header.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}

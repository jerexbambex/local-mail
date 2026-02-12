
import { AlertTriangle, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface EmailAnalysisProps {
    html: string;
    text: string;
}

interface AnalysisResult {
    type: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

export function EmailAnalysis({ html, text }: EmailAnalysisProps) {
    const analyzeHtml = (): AnalysisResult[] => {
        const results: AnalysisResult[] = [];
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Check for viewport meta tag
        if (!doc.querySelector('meta[name="viewport"]')) {
            results.push({
                type: 'warning',
                message: 'Missing Viewport Meta Tag',
                details: 'Emails should include a viewport meta tag for mobile responsiveness.'
            });
        }

        // Check for script tags (Security risk)
        if (doc.querySelector('script')) {
            results.push({
                type: 'error',
                message: 'Script Tags Detected',
                details: 'JavaScript is not supported in most email clients and poses a security risk.'
            });
        }

        // Check for images without alt text
        const images = doc.querySelectorAll('img');
        let missingAltCount = 0;
        images.forEach(img => {
            if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
                missingAltCount++;
            }
        });

        if (missingAltCount > 0) {
            results.push({
                type: 'warning',
                message: `Missing Alt Text (${missingAltCount} images)`,
                details: 'Images should have alt text for accessibility and when images are blocked.'
            });
        }

        // Check for absolute URLs
        const links = doc.querySelectorAll('a');
        let relativeUrlCount = 0;
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                relativeUrlCount++;
            }
        });

        if (relativeUrlCount > 0) {
            results.push({
                type: 'error',
                message: `Relative URLs Detected (${relativeUrlCount})`,
                details: 'Links in emails must be absolute URLs to work correctly.'
            });
        }

        return results;
    };

    const extractLinks = () => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const links = Array.from(doc.querySelectorAll('a')).map(a => ({
            text: a.innerText.trim() || '(No Text)',
            href: a.getAttribute('href') || '#',
            valid: a.getAttribute('href')?.startsWith('http')
        }));
        return links;
    };

    const results = analyzeHtml();
    const links = extractLinks();

    return (
        <div className="h-full flex flex-col gap-6 p-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Health Check
                </h3>
                <div className="grid gap-3">
                    {results.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-green-500/10 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                                <div className="font-semibold">All Checks Passed</div>
                                <div className="text-sm opacity-90">HTML structure looks good for email clients.</div>
                            </div>
                        </div>
                    ) : (
                        results.map((result, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${result.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                                    result.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                                        'bg-muted'
                                }`}>
                                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">{result.message}</div>
                                    <div className="text-sm opacity-90">{result.details}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 rounded-md border p-4">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Link Analysis ({links.length})
                </h3>
                <div className="space-y-3">
                    {links.map((link, i) => (
                        <div key={i} className="flex items-center justify-between text-sm group pb-2 border-b last:border-0 last:pb-0">
                            <div className="grid gap-1">
                                <span className="font-medium truncate max-w-[300px]">{link.text}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[400px] font-mono">{link.href}</span>
                            </div>
                            <Badge variant={link.valid ? 'outline' : 'destructive'} className="shrink-0">
                                {link.valid ? 'Valid URL' : 'Invalid'}
                            </Badge>
                        </div>
                    ))}
                    {links.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                            No links found in this email.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

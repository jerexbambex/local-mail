import { AlertTriangle, CheckCircle, ExternalLink, ImageOff, MonitorCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailAnalysisProps {
    html: string;
    text: string;
    defaultTab?: 'health' | 'links' | 'spam' | 'testing';
}

interface AnalysisResult {
    type: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

export function EmailAnalysis({ html, text, defaultTab = 'health' }: EmailAnalysisProps) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const results = analyzeHtml(doc);
    const links = extractLinks(doc);
    const images = Array.from(doc.querySelectorAll('img'));
    const missingAltCount = images.filter((image) => !image.getAttribute('alt')).length;
    const hasReadableCopy = Boolean(text.trim().length || doc.body?.textContent?.trim().length);
    const spamScore = Math.min(10, results.length * 1.4 + missingAltCount * 0.3);

    return (
        <Tabs defaultValue={defaultTab} className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 grid w-auto grid-cols-4">
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="spam">Spam</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="min-h-0 flex-1 p-4 pt-3">
                <div className="grid gap-3">
                    {results.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-lg border bg-green-500/10 p-4 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                                <div className="font-semibold">All checks passed</div>
                                <div className="text-sm opacity-90">HTML structure looks ready for common email clients.</div>
                            </div>
                        </div>
                    ) : (
                        results.map((result) => (
                            <div
                                key={result.message}
                                className={`flex items-start gap-3 rounded-lg border p-3 ${
                                    result.type === 'error'
                                        ? 'border-destructive/20 bg-destructive/10 text-destructive'
                                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                }`}
                            >
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <div className="font-medium">{result.message}</div>
                                    <div className="text-sm opacity-90">{result.details}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </TabsContent>

            <TabsContent value="links" className="min-h-0 flex-1 p-4 pt-3">
                <ScrollArea className="h-full rounded-md border p-4">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <ExternalLink className="h-4 w-4" />
                        Link checker ({links.length})
                    </h3>
                    <div className="space-y-3">
                        {links.map((link, index) => (
                            <div
                                key={`${link.href}-${index}`}
                                className="group flex items-center justify-between gap-4 border-b pb-2 text-sm last:border-0 last:pb-0"
                            >
                                <div className="grid min-w-0 gap-1">
                                    <span className="truncate font-medium">{link.text}</span>
                                    <span className="truncate font-mono text-xs text-muted-foreground">{link.href}</span>
                                </div>
                                <Badge variant={link.valid ? 'outline' : 'destructive'} className="shrink-0">
                                    {link.valid ? 'Reachable format' : 'Needs review'}
                                </Badge>
                            </div>
                        ))}
                        {links.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No links found in this email.</div>}
                    </div>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="spam" className="min-h-0 flex-1 p-4 pt-3">
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Estimated score</div>
                        <div className="mt-2 text-4xl font-semibold">{spamScore.toFixed(1)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Lower is better</div>
                    </div>
                    <div className="grid gap-3">
                        <SpamSignal label="Absolute links" active={links.every((link) => link.valid)} />
                        <SpamSignal label="No scripts" active={!doc.querySelector('script')} />
                        <SpamSignal label="Alt text coverage" active={missingAltCount === 0} />
                        <SpamSignal label="Readable body copy" active={hasReadableCopy} />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="testing" className="min-h-0 flex-1 p-4 pt-3">
                <div className="grid gap-3 md:grid-cols-3">
                    <TestingCard
                        icon={MonitorCheck}
                        title="Responsive previews"
                        description="Use the device controls above the HTML tab to inspect desktop, tablet, and mobile layouts."
                    />
                    <TestingCard
                        icon={ImageOff}
                        title="Images blocked"
                        description={`${images.length} image${images.length === 1 ? '' : 's'} found, ${missingAltCount} without alt text.`}
                    />
                    <TestingCard
                        icon={ExternalLink}
                        title="One-time links"
                        description="Review verification and password reset links before opening them."
                    />
                </div>
            </TabsContent>
        </Tabs>
    );
}

function analyzeHtml(doc: Document): AnalysisResult[] {
    const results: AnalysisResult[] = [];

    if (!doc.querySelector('meta[name="viewport"]')) {
        results.push({
            type: 'warning',
            message: 'Missing viewport meta tag',
            details: 'Emails should include a viewport meta tag for mobile responsiveness.',
        });
    }

    if (doc.querySelector('script')) {
        results.push({
            type: 'error',
            message: 'Script tags detected',
            details: 'JavaScript is not supported in most email clients and may be stripped.',
        });
    }

    const missingAltCount = Array.from(doc.querySelectorAll('img')).filter(
        (image) => !image.hasAttribute('alt') || image.getAttribute('alt') === '',
    ).length;

    if (missingAltCount > 0) {
        results.push({
            type: 'warning',
            message: `Missing alt text (${missingAltCount} images)`,
            details: 'Images should include alt text for accessibility and blocked-image states.',
        });
    }

    const relativeUrlCount = extractLinks(doc).filter((link) => !link.valid).length;

    if (relativeUrlCount > 0) {
        results.push({
            type: 'error',
            message: `Relative URLs detected (${relativeUrlCount})`,
            details: 'Email links need absolute URLs to work outside your local app.',
        });
    }

    return results;
}

function extractLinks(doc: Document) {
    return Array.from(doc.querySelectorAll('a')).map((anchor) => {
        const href = anchor.getAttribute('href') || '#';

        return {
            text: anchor.innerText.trim() || '(No text)',
            href,
            valid: href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'),
        };
    });
}

function SpamSignal({ label, active }: { label: string; active: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span>{label}</span>
            <Badge variant={active ? 'outline' : 'destructive'}>{active ? 'Pass' : 'Review'}</Badge>
        </div>
    );
}

function TestingCard({ icon: Icon, title, description }: { icon: ComponentType<{ className?: string }>; title: string; description: string }) {
    return (
        <div className="rounded-lg border p-4">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className="mt-3 font-medium">{title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

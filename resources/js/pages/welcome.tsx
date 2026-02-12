import { Head, Link } from '@inertiajs/react';
import { Mail, Server, ArrowRight, Copy, Check, Terminal, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModeToggle } from '@/components/mode-toggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Head title="Welcome" />

            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="flex flex-col items-center text-center space-y-8 mb-16">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                        <Mail className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                        Local SMTP Server
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                        A lightweight, developer-focused email testing tool for your local applications. Catch, inspect, and debug emails instantly.
                    </p>

                    <div className="flex gap-4">
                        <Link href="/inbox">
                            <Button size="lg" className="h-12 px-8 text-base group">
                                Open Inbox
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-8">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-primary" />
                                Quick Start & Configuration
                            </CardTitle>
                            <CardDescription>
                                Copy the configuration below to start testing immediately with your preferred language or tool.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="laravel" className="w-full">
                                <TabsList className="w-full justify-start overflow-auto mb-4 bg-muted/50 p-1">
                                    <TabsTrigger value="laravel">Laravel (.env)</TabsTrigger>
                                    <TabsTrigger value="curl">Curl</TabsTrigger>
                                    <TabsTrigger value="node">Node.js</TabsTrigger>
                                    <TabsTrigger value="php">PHP</TabsTrigger>
                                    <TabsTrigger value="python">Python</TabsTrigger>
                                    <TabsTrigger value="go">Go</TabsTrigger>
                                </TabsList>

                                <CodeBlock
                                    language="dotenv"
                                    value={`MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null`}
                                    tab="laravel"
                                />

                                <CodeBlock
                                    language="bash"
                                    value={`curl -v smtp://127.0.0.1:1025 \\
    --mail-from hello@example.com \\
    --mail-rcpt to@example.com \\
    -T <(echo -e "Subject: Test\\n\\nThis is a test email")`}
                                    tab="curl"
                                />

                                <CodeBlock
                                    language="javascript"
                                    value={`const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "127.0.0.1",
  port: 1025,
  secure: false, // true for 465, false for other ports
});

await transporter.sendMail({
  from: '"Fred Foo" <foo@example.com>',
  to: "bar@example.com",
  subject: "Hello ✔",
  text: "Hello world?",
});`}
                                    tab="node"
                                />

                                <CodeBlock
                                    language="php"
                                    value={`<?php
// Using PHPMailer
$mail = new PHPMailer();
$mail->isSMTP();
$mail->Host = '127.0.0.1';
$mail->Port = 1025;

// Native PHP
ini_set("SMTP", "127.0.0.1");
ini_set("smtp_port", "1025");
mail("to@example.com", "Test Subject", "Test Body");`}
                                    tab="php"
                                />

                                <CodeBlock
                                    language="python"
                                    value={`import smtplib

sender = "from@example.com"
receiver = "to@example.com"
message = """Subject: Test Email

This is a test email message."""

with smtplib.SMTP("127.0.0.1", 1025) as server:
    server.sendmail(sender, receiver, message)`}
                                    tab="python"
                                />

                                <CodeBlock
                                    language="go"
                                    value={`package main

import (
	"log"
	"net/smtp"
)

func main() {
	// Connect to the server, authenticate, set the sender and recipient,
	// and send the email all in one step.
	to := []string{"recipient@example.net"}
	msg := []byte("To: recipient@example.net\\r\\n" +
		"Subject: discount Gophers!\\r\\n" +
		"\\r\\n" +
		"This is the email body.\\r\\n")
	err := smtp.SendMail("127.0.0.1:1025", nil, "sender@example.org", to, msg)
	if err != nil {
		log.Fatal(err)
	}
}`}
                                    tab="go"
                                />
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="p-6 rounded-lg bg-card/30 border border-border/30">
                            <div className="font-semibold mb-1">Host</div>
                            <code className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">127.0.0.1</code>
                        </div>
                        <div className="p-6 rounded-lg bg-card/30 border border-border/30">
                            <div className="font-semibold mb-1">SMTP Port</div>
                            <code className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">1025</code>
                        </div>
                        <div className="p-6 rounded-lg bg-card/30 border border-border/30">
                            <div className="font-semibold mb-1">Dashboard</div>
                            <code className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">/inbox</code>
                        </div>
                    </div>
                </div>

                <footer className="mt-24 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} SMTP Server. Built for developers.</p>
                </footer>
            </div>
        </div>
    );
}

function CodeBlock({ language, value, tab }: { language: string; value: string; tab: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TabsContent value={tab} className="mt-0">
            <div className="relative group">
                <div className="absolute top-0 left-0 px-4 py-2 text-xs text-muted-foreground bg-muted/50 rounded-tl-lg rounded-br-lg border-b border-r border-border/50 font-sans">
                    {language}
                </div>
                <pre className="bg-muted/30 p-6 pt-10 rounded-lg font-mono text-sm overflow-x-auto border border-border/50 min-h-[150px]">
                    <code>{value}</code>
                </pre>
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </TabsContent>
    );
}

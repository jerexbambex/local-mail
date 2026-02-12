<?php

namespace App\Services;

use App\Models\Attachment;
use App\Models\Email;
use Illuminate\Support\Facades\Storage;
use ZBateson\MailMimeParser\MailMimeParser;

class EmailParser
{
    public function __construct(
        private MailMimeParser $parser
    ) {}

    public function parse(string $rawMessage): Email
    {
        $message = $this->parser->parse($rawMessage, false);

        $email = Email::create([
            'from' => $message->getHeaderValue('from') ?? 'unknown@localhost',
            'to' => $this->parseAddresses($message->getHeaderValue('to')) ?? ['unknown@localhost'],
            'cc' => $this->parseAddresses($message->getHeaderValue('cc')),
            'bcc' => $this->parseAddresses($message->getHeaderValue('bcc')),
            'subject' => $message->getHeaderValue('subject') ?? '(No Subject)',
            'html_body' => $message->getHtmlContent(),
            'text_body' => $message->getTextContent() ?? $message->getContent(),
            'raw_message' => $rawMessage,
            'size' => strlen($rawMessage),
        ]);

        $attachmentCount = 0;
        foreach ($message->getAllAttachmentParts() as $attachment) {
            $this->saveAttachment($email, $attachment);
            $attachmentCount++;
        }

        $email->update(['attachments_count' => $attachmentCount]);

        return $email;
    }

    private function parseAddresses(?string $addresses): ?array
    {
        if (! $addresses) {
            return null;
        }

        return array_map('trim', explode(',', $addresses));
    }

    private function saveAttachment(Email $email, $attachmentPart): void
    {
        $filename = $attachmentPart->getFilename() ?? 'attachment_'.uniqid();
        $content = $attachmentPart->getContent();
        $path = 'attachments/'.$email->id.'/'.$filename;

        Storage::put($path, $content);

        Attachment::create([
            'email_id' => $email->id,
            'filename' => $filename,
            'content_type' => $attachmentPart->getContentType() ?? 'application/octet-stream',
            'size' => strlen($content),
            'path' => $path,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Email;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmailController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Email::query()
            ->with('attachments')
            ->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('from', 'like', "%{$search}%")
                    ->orWhere('text_body', 'like', "%{$search}%");
            });
        }

        if ($request->has('unread')) {
            $query->whereNull('read_at');
        }

        $emails = $query->paginate(50);

        return response()->json($emails);
    }

    public function show(Email $email): JsonResponse
    {
        $email->markAsRead();
        $email->load('attachments');

        return response()->json($email);
    }

    public function destroy(Email $email): JsonResponse
    {
        Storage::deleteDirectory('attachments/'.$email->id);
        $email->delete();

        return response()->json(['message' => 'Email deleted']);
    }

    public function destroyAll(): JsonResponse
    {
        Storage::deleteDirectory('attachments');
        Email::query()->delete();

        return response()->json(['message' => 'All emails deleted']);
    }

    public function source(Email $email): JsonResponse
    {
        return response()->json(['source' => $email->raw_message]);
    }

    public function downloadAttachment(Email $email, string $attachmentId): mixed
    {
        $attachment = $email->attachments()->findOrFail($attachmentId);

        return Storage::download($attachment->path, $attachment->filename);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Email::count(),
            'unread' => Email::whereNull('read_at')->count(),
            'total_size' => Email::sum('size'),
        ]);
    }
    public function unread(Email $email): JsonResponse
    {
        $email->update(['read_at' => null]);

        return response()->json(['message' => 'Email marked as unread']);
    }

    public function download(Email $email): mixed
    {
        return response($email->raw_message)
            ->header('Content-Type', 'message/rfc822')
            ->header('Content-Disposition', 'attachment; filename="email-'.$email->id.'.eml"');
    }
}

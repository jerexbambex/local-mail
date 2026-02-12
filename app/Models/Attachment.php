<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    /** @use HasFactory<\Database\Factories\AttachmentFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'email_id',
        'filename',
        'content_type',
        'size',
        'path',
    ];

    public function email(): BelongsTo
    {
        return $this->belongsTo(Email::class);
    }
}

#!/usr/bin/env php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;

Mail::raw('This is a test email sent at '.now(), function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email from Laravel');
});

echo "Email sent!\n";

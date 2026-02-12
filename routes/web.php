<?php

use App\Http\Controllers\Api\EmailController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/inbox', function () {
    return Inertia::render('inbox');
})->name('inbox');

Route::prefix('api')->group(function () {
    Route::delete('/emails', [EmailController::class, 'destroyAll']);
    Route::get('/emails', [EmailController::class, 'index']);
    Route::get('/emails/{email}', [EmailController::class, 'show']);
    Route::delete('/emails/{email}', [EmailController::class, 'destroy']);
    Route::get('/emails/{email}/source', [EmailController::class, 'source']);
    Route::get('/emails/{email}/attachments/{attachmentId}', [EmailController::class, 'downloadAttachment']);
    Route::get('/stats', [EmailController::class, 'stats']);
    Route::put('/emails/{email}/unread', [EmailController::class, 'unread']);
    Route::get('/emails/{email}/download', [EmailController::class, 'download']);
});

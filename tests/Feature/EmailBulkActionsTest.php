<?php

use App\Models\Email;

it('deletes selected emails only', function () {
    $selected = Email::factory()->count(2)->create();
    $unselected = Email::factory()->create();

    $this->postJson('/api/emails/bulk-delete', [
        'ids' => $selected->pluck('id')->all(),
    ])->assertSuccessful()
        ->assertJsonPath('count', 2);

    foreach ($selected as $email) {
        $this->assertDatabaseMissing('emails', ['id' => $email->id]);
    }

    $this->assertDatabaseHas('emails', ['id' => $unselected->id]);
});

it('marks selected emails as unread only', function () {
    $selected = Email::factory()->count(2)->create(['read_at' => now()]);
    $unselected = Email::factory()->create(['read_at' => now()]);

    $this->postJson('/api/emails/bulk-unread', [
        'ids' => $selected->pluck('id')->all(),
    ])->assertSuccessful()
        ->assertJsonPath('count', 2);

    foreach ($selected as $email) {
        $this->assertDatabaseHas('emails', [
            'id' => $email->id,
            'read_at' => null,
        ]);
    }

    expect($unselected->fresh()->read_at)->not->toBeNull();
});

it('validates selected email ids', function () {
    $this->postJson('/api/emails/bulk-delete', [
        'ids' => ['not-a-uuid'],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('ids.0');
});

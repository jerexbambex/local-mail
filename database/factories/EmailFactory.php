<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Email>
 */
class EmailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $htmlBody = fake()->randomHtml();
        $textBody = strip_tags($htmlBody);

        return [
            'from' => fake()->email(),
            'to' => [fake()->email()],
            'cc' => fake()->boolean(30) ? [fake()->email()] : null,
            'bcc' => fake()->boolean(20) ? [fake()->email()] : null,
            'subject' => fake()->sentence(),
            'html_body' => $htmlBody,
            'text_body' => $textBody,
            'raw_message' => "From: {$this->faker->email()}\r\nTo: {$this->faker->email()}\r\nSubject: {$this->faker->sentence()}\r\n\r\n{$textBody}",
            'size' => strlen($htmlBody),
            'attachments_count' => 0,
            'read_at' => fake()->boolean(50) ? now() : null,
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => null,
        ]);
    }

    public function withAttachments(int $count = 1): static
    {
        return $this->state(fn (array $attributes) => [
            'attachments_count' => $count,
        ]);
    }
}

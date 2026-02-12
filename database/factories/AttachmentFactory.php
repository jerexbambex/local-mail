<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attachment>
 */
class AttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = fake()->word().'.'.fake()->fileExtension();
        $size = fake()->numberBetween(1024, 5242880);

        return [
            'filename' => $filename,
            'content_type' => fake()->mimeType(),
            'size' => $size,
            'path' => 'attachments/'.fake()->uuid().'_'.$filename,
        ];
    }
}

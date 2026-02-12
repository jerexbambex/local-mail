<?php

namespace App\Console\Commands;

use App\Services\SmtpServer;
use Illuminate\Console\Command;

class SmtpServerCommand extends Command
{
    protected $signature = 'smtp:serve {--host=0.0.0.0} {--port=1025}';

    protected $description = 'Start the SMTP server';

    public function handle(SmtpServer $server): int
    {
        $host = $this->option('host');
        $port = (int) $this->option('port');

        $this->info("Starting SMTP server on {$host}:{$port}...");

        $server = new SmtpServer(
            app(\App\Services\EmailParser::class),
            $host,
            $port
        );

        $server->start();

        return self::SUCCESS;
    }
}

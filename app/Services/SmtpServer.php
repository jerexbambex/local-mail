<?php

namespace App\Services;

use React\EventLoop\Loop;
use React\Socket\ConnectionInterface;
use React\Socket\SocketServer;

class SmtpServer
{
    private SocketServer $socket;

    private array $sessions = [];

    public function __construct(
        private EmailParser $parser,
        private string $host = '0.0.0.0',
        private int $port = 1025
    ) {}

    public function start(): void
    {
        $this->socket = new SocketServer("{$this->host}:{$this->port}");

        echo "SMTP Server listening on {$this->host}:{$this->port}\n";

        $this->socket->on('connection', function (ConnectionInterface $connection) {
            $sessionId = spl_object_id($connection);
            $this->sessions[$sessionId] = [
                'from' => null,
                'to' => [],
                'data' => '',
                'in_data' => false,
                'buffer' => '',
            ];

            $connection->write("220 localhost ESMTP\r\n");

            $connection->on('data', function ($data) use ($connection, $sessionId) {
                $this->handleData($connection, $sessionId, $data);
            });

            $connection->on('close', function () use ($sessionId) {
                unset($this->sessions[$sessionId]);
            });
        });

        Loop::run();
    }

    private function handleData(ConnectionInterface $connection, int $sessionId, string $data): void
    {
        $session = &$this->sessions[$sessionId];
        $session['buffer'] .= $data;

        while (($pos = strpos($session['buffer'], "\n")) !== false) {
            $line = substr($session['buffer'], 0, $pos + 1);
            $session['buffer'] = substr($session['buffer'], $pos + 1);

            $this->processLine($connection, $sessionId, $line);
        }
    }

    private function processLine(ConnectionInterface $connection, int $sessionId, string $line): void
    {
        $session = &$this->sessions[$sessionId];

        if ($session['in_data']) {
            if (trim($line) === '.') {
                $session['in_data'] = false;
                $this->storeEmail($session);
                $connection->write("250 OK: Message accepted\r\n");
                $this->resetSession($sessionId);
            } else {
                $session['data'] .= $line;
            }

            return;
        }

        $command = strtoupper(trim(substr($line, 0, 4)));

        match ($command) {
            'HELO', 'EHLO' => $connection->write("250 Hello\r\n"),
            'MAIL' => $this->handleMail($connection, $sessionId, $line),
            'RCPT' => $this->handleRcpt($connection, $sessionId, $line),
            'DATA' => $this->handleDataCommand($connection, $sessionId),
            'RSET' => $this->handleRset($connection, $sessionId),
            'QUIT' => $this->handleQuit($connection),
            default => $connection->write("500 Command not recognized\r\n"),
        };
    }

    private function handleMail(ConnectionInterface $connection, int $sessionId, string $data): void
    {
        preg_match('/<(.+?)>/', $data, $matches);
        $this->sessions[$sessionId]['from'] = $matches[1] ?? null;
        $connection->write("250 OK\r\n");
    }

    private function handleRcpt(ConnectionInterface $connection, int $sessionId, string $data): void
    {
        preg_match('/<(.+?)>/', $data, $matches);
        if (isset($matches[1])) {
            $this->sessions[$sessionId]['to'][] = $matches[1];
        }
        $connection->write("250 OK\r\n");
    }

    private function handleDataCommand(ConnectionInterface $connection, int $sessionId): void
    {
        $this->sessions[$sessionId]['in_data'] = true;
        $connection->write("354 Start mail input; end with <CRLF>.<CRLF>\r\n");
    }

    private function handleRset(ConnectionInterface $connection, int $sessionId): void
    {
        $this->resetSession($sessionId);
        $connection->write("250 OK\r\n");
    }

    private function handleQuit(ConnectionInterface $connection): void
    {
        $connection->write("221 Bye\r\n");
        $connection->close();
    }

    private function storeEmail(array $session): void
    {
        try {
            $this->parser->parse($session['data']);
            echo "Email stored successfully\n";
        } catch (\Exception $e) {
            echo "Error parsing email: {$e->getMessage()}\n";
        }
    }

    private function resetSession(int $sessionId): void
    {
        $this->sessions[$sessionId]['from'] = null;
        $this->sessions[$sessionId]['to'] = [];
        $this->sessions[$sessionId]['data'] = '';
        $this->sessions[$sessionId]['in_data'] = false;
    }
}

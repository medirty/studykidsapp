<?php

declare(strict_types=1);

namespace StudyKids\Support;

use PDO;

/** Lazy PDO connection: connects on first pdo() call so callers can handle connection failures. */
class Database
{
    private ?PDO $pdo = null;

    public function __construct(
        private readonly string $dsn,
        private readonly string $user,
        #[\SensitiveParameter]
        private readonly string $password,
    ) {}

    /** @param array<string, mixed> $env */
    public static function fromEnv(array $env): self
    {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            (string) ($env['DB_HOST'] ?? '127.0.0.1'),
            (int) ($env['DB_PORT'] ?? 3306),
            (string) ($env['DB_NAME'] ?? ''),
        );

        return new self($dsn, (string) ($env['DB_USER'] ?? ''), (string) ($env['DB_PASS'] ?? ''));
    }

    public function pdo(): PDO
    {
        return $this->pdo ??= new PDO($this->dsn, $this->user, $this->password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
}

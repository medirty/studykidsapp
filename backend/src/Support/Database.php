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
        if ($this->pdo === null) {
            $pdo = new PDO($this->dsn, $this->user, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // Same behaviour on every server (CR-004): strict mode, UTC, utf8mb4_unicode_ci.
            $pdo->exec("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ZERO_DATE,NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION'");
            $pdo->exec("SET SESSION time_zone = '+00:00'");
            $pdo->exec('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
            $this->pdo = $pdo;
        }

        return $this->pdo;
    }
}

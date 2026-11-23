<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

// Same env precedence as public/index.php: real environment wins over backend/.env.
Dotenv\Dotenv::createImmutable(__DIR__)->safeLoad();
$env = $_ENV + getenv();

$connection = static fn(string $dbVar): array => [
    'adapter' => 'mysql',
    'host' => (string) ($env['DB_HOST'] ?? '127.0.0.1'),
    'port' => (int) ($env['DB_PORT'] ?? 3306),
    'name' => (string) ($env[$dbVar] ?? ''),
    'user' => (string) ($env['DB_USER'] ?? ''),
    'pass' => (string) ($env['DB_PASS'] ?? ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];

return [
    'paths' => [
        'migrations' => __DIR__ . '/db/migrations',
        'seeds' => __DIR__ . '/db/seeds',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => 'development',
        'development' => $connection('DB_NAME'),
        'testing' => $connection('DB_TEST_NAME'),
    ],
    'version_order' => 'creation',
];

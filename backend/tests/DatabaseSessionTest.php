<?php

declare(strict_types=1);

namespace StudyKids\Tests;

use PHPUnit\Framework\TestCase;
use StudyKids\Support\Database;

final class DatabaseSessionTest extends TestCase
{
    public function testConnectionPinsUtcStrictModeAndCollation(): void
    {
        $env = $_ENV + getenv();
        $env['DB_NAME'] = $env['DB_TEST_NAME'] ?? 'studykids_test';

        $row = Database::fromEnv($env)->pdo()
            ->query('SELECT @@SESSION.time_zone AS tz, @@SESSION.sql_mode AS mode, @@SESSION.collation_connection AS coll')
            ->fetch();

        self::assertSame('+00:00', $row['tz']);
        self::assertSame('utf8mb4_unicode_ci', $row['coll']);
        $modes = explode(',', (string) $row['mode']);
        sort($modes);
        self::assertSame(
            ['ERROR_FOR_DIVISION_BY_ZERO', 'NO_ENGINE_SUBSTITUTION', 'NO_ZERO_DATE', 'NO_ZERO_IN_DATE', 'STRICT_TRANS_TABLES'],
            $modes,
        );
    }
}

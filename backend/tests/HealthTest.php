<?php

declare(strict_types=1);

namespace StudyKids\Tests;

use DI\Container;
use PDO;
use PDOException;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Slim\App;
use Slim\Psr7\Factory\ServerRequestFactory;
use StudyKids\Support\AppFactory;
use StudyKids\Support\Database;

final class HealthTest extends TestCase
{
    public function testHealthReportsDbOkWhenDatabaseIsReachable(): void
    {
        $env = $_ENV + getenv();
        $env['DB_NAME'] = $env['DB_TEST_NAME'] ?? 'studykids_test';

        $response = $this->get(AppFactory::create(Database::fromEnv($env)), '/api/health');

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('application/json', $response->getHeaderLine('Content-Type'));
        self::assertSame(['status' => 'ok', 'db' => 'ok'], $this->json($response));
    }

    public function testHealthReportsDbErrorWithoutLeakingDetails(): void
    {
        $response = $this->get(AppFactory::create($this->brokenDatabase()), '/api/health');

        self::assertSame(503, $response->getStatusCode());
        self::assertSame(['status' => 'ok', 'db' => 'error'], $this->json($response));
        self::assertStringNotContainsString('secret', (string) $response->getBody());
    }

    public function testUnknownRouteReturnsJson404(): void
    {
        $response = $this->get(AppFactory::create($this->brokenDatabase()), '/api/nope');

        self::assertSame(404, $response->getStatusCode());
        self::assertStringContainsString('application/json', $response->getHeaderLine('Content-Type'));
    }

    public function testUnexpectedErrorReturnsJson500WithoutDetails(): void
    {
        $app = AppFactory::create($this->brokenDatabase());
        $app->get('/api/boom', function (): never {
            throw new \RuntimeException('secret internal detail');
        });

        $response = $this->get($app, '/api/boom');

        self::assertSame(500, $response->getStatusCode());
        self::assertStringContainsString('application/json', $response->getHeaderLine('Content-Type'));
        self::assertStringNotContainsString('secret', (string) $response->getBody());
        self::assertStringNotContainsString('.php', (string) $response->getBody());
    }

    private function brokenDatabase(): Database
    {
        return new class extends Database {
            public function __construct() {}

            public function pdo(): PDO
            {
                throw new PDOException('secret password=hunter2 host=10.0.0.1');
            }
        };
    }

    /** @param App<Container> $app */
    private function get(App $app, string $path): ResponseInterface
    {
        return $app->handle((new ServerRequestFactory())->createServerRequest('GET', $path));
    }

    /** @return array<string, mixed> */
    private function json(ResponseInterface $response): array
    {
        $data = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);
        self::assertIsArray($data);

        return $data;
    }
}

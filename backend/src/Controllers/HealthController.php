<?php

declare(strict_types=1);

namespace StudyKids\Controllers;

use PDOException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use StudyKids\Support\Database;

final class HealthController
{
    public function __construct(private readonly Database $db) {}

    public function __invoke(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $dbOk = $this->pingDatabase();
        $response->getBody()->write(json_encode(
            ['status' => 'ok', 'db' => $dbOk ? 'ok' : 'error'],
            JSON_THROW_ON_ERROR,
        ));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($dbOk ? 200 : 503);
    }

    private function pingDatabase(): bool
    {
        try {
            $stmt = $this->db->pdo()->prepare('SELECT 1');
            $stmt->execute();

            return (int) $stmt->fetchColumn() === 1;
        } catch (PDOException $e) {
            // Details (host, user, driver message) go to the server log only, never to the client.
            error_log('health: database unreachable: ' . $e->getMessage());

            return false;
        }
    }
}

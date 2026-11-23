<?php

declare(strict_types=1);

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use StudyKids\Controllers\HealthController;

return function (App $app): void {
    $app->group('/api', function (RouteCollectorProxy $api): void {
        $api->get('/health', HealthController::class);
    });
};

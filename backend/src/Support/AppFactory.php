<?php

declare(strict_types=1);

namespace StudyKids\Support;

use DI\Container;
use Slim\App;
use Slim\Factory\AppFactory as SlimAppFactory;
use Slim\Handlers\ErrorHandler;

final class AppFactory
{
    /** @return App<Container> */
    public static function create(Database $db): App
    {
        $container = new Container([Database::class => $db]);
        $app = SlimAppFactory::createFromContainer($container);

        $app->addBodyParsingMiddleware();
        $app->addRoutingMiddleware();
        // Never show error details to clients; Slim logs the error type server-side.
        $errorHandler = new ErrorHandler($app->getCallableResolver(), $app->getResponseFactory());
        $errorHandler->forceContentType('application/json');
        $app->addErrorMiddleware(false, true, false)->setDefaultErrorHandler($errorHandler);

        (require __DIR__ . '/../Routes/api.php')($app);

        return $app;
    }
}

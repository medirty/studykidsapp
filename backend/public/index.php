<?php

declare(strict_types=1);

use StudyKids\Support\AppFactory;
use StudyKids\Support\Database;

require __DIR__ . '/../vendor/autoload.php';

Dotenv\Dotenv::createImmutable(dirname(__DIR__))->safeLoad();

AppFactory::create(Database::fromEnv($_ENV + getenv()))->run();

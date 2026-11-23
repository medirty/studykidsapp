<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

// Keep expected error logs (404/500/DB-down tests) out of the test output.
ini_set('error_log', sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'studykids-phpunit.log');

// Local: read backend/.env. CI: variables come from the real environment.
Dotenv\Dotenv::createImmutable(dirname(__DIR__))->safeLoad();

<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

/** PRD §12.1: key/value settings (prices, quota, limits), editable from admin later. */
final class CreateSettings extends AbstractMigration
{
    public function change(): void
    {
        $this->table('settings', ['id' => false, 'primary_key' => 'key'])
            ->addColumn('key', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('value_json', 'json')
            ->create();
    }
}

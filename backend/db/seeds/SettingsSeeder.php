<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

/** Dev/test defaults from PRD §4.2. Production values are managed via admin, not this seed. */
final class SettingsSeeder extends AbstractSeed
{
    public function run(): void
    {
        $defaults = [
            'price_early' => 50000,
            'price_normal' => 100000,
            'early_quota' => 100,
            'pending_ttl_minutes' => 60,
            'min_price' => 25000,
        ];

        $rows = [];
        foreach ($defaults as $key => $value) {
            $rows[] = ['key' => $key, 'value_json' => json_encode($value)];
        }
        $this->table('settings')->insert($rows)->saveData();
    }
}

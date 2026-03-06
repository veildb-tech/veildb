<?php

declare(strict_types=1);

namespace App\Service\Database\Rule;

use App\Enums\Database\Rule\FakersEnum;

class FakerOptionsFactory
{
    public function create(string $type): FakerOptionsInterface
    {
        return match ($type) {
            FakersEnum::RANDOM_NUMBER->value => new FakerOptions\NumberBetween(),
            FakersEnum::DATE_BETWEEN->value => new FakerOptions\DateTimeBetween(),
            default => new FakerOptions\DefaultFaker(),
        };
    }
}

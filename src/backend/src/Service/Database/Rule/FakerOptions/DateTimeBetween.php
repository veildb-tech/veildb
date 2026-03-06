<?php

declare(strict_types=1);

namespace App\Service\Database\Rule\FakerOptions;

use App\Service\Database\Rule\FakerOptionsInterface;

class DateTimeBetween implements FakerOptionsInterface
{
    /**
     * @var array|string[]
     */
    private array $allowedOption = ['date1', 'date2'];

    /**
     * Remove not valid options
     *
     * @param array|null $options
     * @return array
     */
    public function process(?array $options): array
    {
        foreach ($options as $key => $value) {
            if (!in_array($key, $this->allowedOption) || !strtotime($value)) {
                unset($options[$key]);
            }
        }

        return $options;
    }
}
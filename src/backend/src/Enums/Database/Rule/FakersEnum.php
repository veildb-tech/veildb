<?php

declare(strict_types=1);

namespace App\Enums\Database\Rule;

use App\Enums\ConfigurableEnumInterface;
use App\Enums\ConfigurableEnumTrait;
use App\Enums\Database\Rule\Engine\MysqlTypesEnum;
use App\Enums\Database\Rule\Engine\PostgresTypesEnum;

enum FakersEnum: string implements ConfigurableEnumInterface
{
    use ConfigurableEnumTrait;

    case ADDRESS = 'address';
    case STREET_ADDRESS = 'streetAddress';
    case COMPANY = 'company';
    case PHONE = 'phoneNumber';
    case EMAIL = 'email';
    case SAFE_EMAIL = 'safeEmail';
    case URL = 'url';
    case WORD = 'word';
    case TEXT = 'text';
    case SENTENCE = 'sentence';
    case PARAGRAPH = 'paragraph';
    case NAME = 'name';
    case FIRSTNAME = 'firstName';
    case LASTNAME = 'lastName';
    case RANDOM_NUMBER = 'numberBetween';
    case DATE_BETWEEN = 'dateTimeBetween';

    public function label(): string
    {
        return match($this) {
            self::ADDRESS => 'Address',
            self::STREET_ADDRESS => 'Street Address',
            self::COMPANY => 'Company',
            self::NAME => 'Full Name',
            self::FIRSTNAME => 'First Name',
            self::LASTNAME => 'Last Name',
            self::TEXT => 'Text',
            self::SENTENCE => 'Sentence',
            self::PARAGRAPH => 'Paragraph',
            self::PHONE => 'Phone',
            self::EMAIL => 'Email',
            self::URL => 'Url',
            self::SAFE_EMAIL => 'Safe Email',
            self::WORD => 'Random word',
            self::RANDOM_NUMBER => 'Random Number',
            self::DATE_BETWEEN => 'Random Date'
        };
    }

    public function getSupportedFieldTypes(): array
    {
        return match($this) {
            self::NAME,
            self::ADDRESS,
            self::STREET_ADDRESS,
            self::FIRSTNAME,
            self::LASTNAME,
            self::TEXT,
            self::SENTENCE,
            self::PARAGRAPH,
            self::PHONE,
            self::EMAIL,
            self::URL,
            self::SAFE_EMAIL,
            self::WORD,
            self::COMPANY => array_values(
                array_unique(
                    array_merge(
                        MysqlTypesEnum::getStringTypes(),
                        PostgresTypesEnum::getStringTypes()
                    )
                )
            ),
            self::RANDOM_NUMBER => array_values(
                array_unique(
                    array_merge(
                        MysqlTypesEnum::getNumericTypes(),
                        MysqlTypesEnum::getStringTypes(),
                        PostgresTypesEnum::getNumericTypes(),
                        PostgresTypesEnum::getStringTypes()
                    )
                )
            ),
            self::DATE_BETWEEN => array_values(
                array_unique(
                    array_merge(
                        MysqlTypesEnum::getDateTypes(),
                        PostgresTypesEnum::getDateTypes()
                    )
                )
            )
        };
    }

    public static function getOptionsWithType(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[] = [
                'value' => $case->value,
                'label' => $case->label(),
                'field_types' => $case->getSupportedFieldTypes()
            ];
        }

        return $options;
    }
}

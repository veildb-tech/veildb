<?php

declare(strict_types=1);

namespace App\Enums\Database\Rule\Engine;

enum PostgresTypesEnum: string
{
    case VARCHAR = 'varchar';
    case LONGTEXT = 'longtext';
    case BPCHAR = 'bpchar';
    case TINYTEXT = 'tinytext';
    case STRING = 'string';
    case TEXT = 'text';
    case INTEGER = 'integer';

    case INTEGER2 = 'int2';
    case INTEGER4 = 'int4';
    case INTEGER8 = 'int8';

    case DECIMAL = 'decimal';
    case FLOAT = 'float';
    case SMALLINT = 'smallint';
    case BIGINT = 'bigint';
    case DATETIME = 'datetime';
    case DATE = 'date';
    case TIMESTAMP = 'timestamp';
    case TIMESTAMPTZ = 'timestamptz';

    // Array types (PostgreSQL internal notation: _type = type[])
    case TEXT_ARRAY = '_text';
    case VARCHAR_ARRAY = '_varchar';
    case BPCHAR_ARRAY = '_bpchar';
    case INT2_ARRAY = '_int2';
    case INT4_ARRAY = '_int4';
    case INT8_ARRAY = '_int8';
    case FLOAT4_ARRAY = '_float4';
    case FLOAT8_ARRAY = '_float8';
    case NUMERIC_ARRAY = '_numeric';
    case DATE_ARRAY = '_date';
    case TIMESTAMP_ARRAY = '_timestamp';
    case TIMESTAMPTZ_ARRAY = '_timestamptz';

    /**
     * @return array
     */
    public static function getStringTypes():array
    {
        return [
            self::STRING->value,
            self::TEXT->value,
            self::VARCHAR->value,
            self::LONGTEXT->value,
            self::TINYTEXT->value,
            self::BPCHAR->value,
            self::TEXT_ARRAY->value,
            self::VARCHAR_ARRAY->value,
            self::BPCHAR_ARRAY->value,
        ];
    }

    /**
     * Retrieves an array of numeric types.
     *
     * @return array An array containing the numeric types.
     */
    public static function getNumericTypes(): array
    {
        return [
            self::INTEGER->value,
            self::DECIMAL->value,
            self::BIGINT->value,
            self::SMALLINT->value,
            self::FLOAT->value,
            // Types from postgresql. TODO: refactor
            self::INTEGER2->value,
            self::INTEGER4->value,
            self::INTEGER8->value,
            self::INT2_ARRAY->value,
            self::INT4_ARRAY->value,
            self::INT8_ARRAY->value,
            self::FLOAT4_ARRAY->value,
            self::FLOAT8_ARRAY->value,
            self::NUMERIC_ARRAY->value,
        ];
    }

    /**
     * Retrieves an array of available date types.
     *
     * The method returns an array containing the available date types.
     * The date types include DATETIME and DATE.
     *
     * @return array An array of available date types.
     */
    public static function getDateTypes(): array
    {
        return [
            self::DATETIME->value,
            self::DATE->value,
            self::TIMESTAMP->value,
            self::TIMESTAMPTZ->value,
            self::DATE_ARRAY->value,
            self::TIMESTAMP_ARRAY->value,
            self::TIMESTAMPTZ_ARRAY->value,
        ];
    }
}

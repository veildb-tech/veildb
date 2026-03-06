---
name: db-rules
description: Add support for new faker types, field types, or rule configurations in VeilDB. Use when the user asks to add a new faker pattern, support a new database column type, or extend the rule/masking system.
---

## Overview

VeilDB masks database columns by applying **faker patterns** to them. A rule defines which tables/columns to process and how. This skill covers adding new faker types and field types end-to-end.

## Key Concepts

- **Method**: How a column is processed — `fake` (Faker PHP generates a value), `update` (set a static value), `truncate` (clear the table).
- **Faker**: A Faker PHP method name (e.g. `email`, `numberBetween`, `dateTimeBetween`). The value stored is the PHP Faker method name string.
- **Options**: Optional parameters passed to the faker (e.g. `int1`/`int2` for `numberBetween`, `date1`/`date2` for `dateTimeBetween`).
- **Field types**: Which DB column types a faker is valid for (`varchar`, `datetime`, `timestamp`, etc.).

---

## Adding a New Faker Type — Checklist

### 1. Backend: `FakersEnum.php`
`src/backend/src/Enums/Database/Rule/FakersEnum.php`

Add a new enum case. The value **must match** the Faker PHP method name exactly:
```php
case MY_FAKER = 'fakerPhpMethodName';
```

Add a human-readable label in `label()`:
```php
self::MY_FAKER => 'My Label',
```

Add supported field types in `getSupportedFieldTypes()`. Use the static helpers on the engine enums:
- `MysqlTypesEnum::getStringTypes()` — varchar, text, string, longtext, tinytext
- `MysqlTypesEnum::getNumericTypes()` — integer, decimal, bigint, smallint, float
- `MysqlTypesEnum::getDateTypes()` — datetime, date
- `PostgresTypesEnum::getStringTypes()` / `getNumericTypes()` / `getDateTypes()` — same categories plus postgres-specific types
```php
self::MY_FAKER => array_values(array_unique(array_merge(
    MysqlTypesEnum::getDateTypes(),
    PostgresTypesEnum::getDateTypes()
))),
```

### 2. Backend: FakerOptions class (only if the faker takes parameters)
`src/backend/src/Service/Database/Rule/FakerOptions/`

Create a new class implementing `FakerOptionsInterface`. Its `process()` method validates and sanitizes the `options` array before it is stored/passed to the agent:
```php
class MyFaker implements FakerOptionsInterface
{
    private array $allowedOption = ['param1', 'param2'];

    public function process(?array $options): array
    {
        foreach ($options as $key => $value) {
            if (!in_array($key, $this->allowedOption) || !<validation>) {
                unset($options[$key]);
            }
        }
        return $options;
    }
}
```

Existing examples:
- `NumberBetween` — validates `int1`/`int2` are numeric
- `DateTimeBetween` — validates `date1`/`date2` pass `strtotime()`
- `DefaultFaker` — no-op, used when no options are needed

### 3. Backend: `FakerOptionsFactory.php`
`src/backend/src/Service/Database/Rule/FakerOptionsFactory.php`

Register the new options class:
```php
FakersEnum::MY_FAKER->value => new FakerOptions\MyFaker(),
```

### 4. Frontend: Processor UI component (only if the faker takes parameters)
`src/frontend/src/sections/rule/detail/schema/column/fake-processors/`

Create a new React component for parameter input. Follow the pattern of `random-number.js` or `date-between.js`:
- Receive `{ row, onUpdate }` props
- Store local state from `row.options ?? { ... defaults ... }`
- Call `onUpdate('options', updatedOptions, row)` on change/blur

### 5. Frontend: `column-fake-row-processor.js`
`src/frontend/src/sections/rule/detail/schema/column/column-fake-row-processor.js`

Add a new condition to render the processor component when `row.value === 'fakerPhpMethodName'`.

---

## Adding a New Field Type — Checklist

### 1. Add the type to the engine enum
- MySQL: `src/backend/src/Enums/Database/Rule/Engine/MysqlTypesEnum.php`
- Postgres: `src/backend/src/Enums/Database/Rule/Engine/PostgresTypesEnum.php`

Add the enum case and include it in the relevant `get*Types()` static method (`getStringTypes`, `getNumericTypes`, `getDateTypes`).

### 2. Update `FakersEnum::getSupportedFieldTypes()`
If the new type belongs to an existing category (e.g. date), it will be picked up automatically via `getDateTypes()`. If it's a new category, add a new `get*Types()` method on the engine enum and reference it in the relevant faker cases.

---

## Data Flow Summary

```
User selects column + faker in UI
  → Frontend stores { name, value (faker method), options } in rule JSON
  → GraphQL mutation saves rule JSON to DatabaseRule entity
  → DatabaseRuleSerializer::processColumns() calls FakerOptionsFactory
      → FakerOptions::process() validates/sanitizes options
  → Serialized rule JSON is sent to the agent
  → Agent invokes $faker->{value}(...$options) per row
```

---

## Files at a Glance

| File | Purpose |
|------|---------|
| `src/backend/src/Enums/Database/Rule/FakersEnum.php` | All available faker types with labels and supported field types |
| `src/backend/src/Enums/Database/Rule/Engine/MysqlTypesEnum.php` | MySQL column type definitions and groupings |
| `src/backend/src/Enums/Database/Rule/Engine/PostgresTypesEnum.php` | Postgres column type definitions and groupings |
| `src/backend/src/Service/Database/Rule/FakerOptionsFactory.php` | Routes faker type → options validator |
| `src/backend/src/Service/Database/Rule/FakerOptions/*.php` | Per-faker option validators |
| `src/backend/src/Api/Serializer/DatabaseRuleSerializer.php` | Serializes rule for agent consumption |
| `src/backend/config/rules/generator_patterns.yaml` | Auto-suggestion patterns (column/table name → faker) |
| `src/frontend/src/sections/rule/detail/schema/column/column-fake-configuration.js` | Faker pattern dropdown, filtered by column type |
| `src/frontend/src/sections/rule/detail/schema/column/column-fake-row-processor.js` | Renders options UI per faker type |
| `src/frontend/src/sections/rule/detail/schema/column/fake-processors/*.js` | Per-faker options input components |

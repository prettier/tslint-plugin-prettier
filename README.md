# tslint-plugin-prettier

[![npm](https://img.shields.io/npm/v/tslint-plugin-prettier.svg)](https://www.npmjs.com/package/tslint-plugin-prettier)
[![build](https://img.shields.io/travis/prettier/tslint-plugin-prettier/master.svg)](https://travis-ci.org/prettier/tslint-plugin-prettier/builds)
[![coverage](https://img.shields.io/codecov/c/github/prettier/tslint-plugin-prettier/master.svg)](https://codecov.io/gh/prettier/tslint-plugin-prettier)

Runs Prettier as a TSLint rule and reports differences as individual TSLint issues.

[Changelog](https://github.com/prettier/tslint-plugin-prettier/blob/master/CHANGELOG.md)

## Sample

```ts
a();;;
    ~~
;;;
~~~ [Delete `;;⏎;;;`]
```

```ts
var foo = ''
          ~~ [Replace `''` with `"";⏎`]
```

```ts
var foo= "";
       ~ [Insert `·`]
```

## Install

```sh
# using npm
npm install --save-dev tslint-plugin-prettier prettier

# using yarn
yarn add --dev tslint-plugin-prettier prettier
```

(require `prettier@^1.9.0`)

## Usage

(tslint.json)

for `tslint@^5.2.0`

```json
{
  "rulesDirectory": ["tslint-plugin-prettier"],
  "rules": {
    "prettier": true
  }
}
```

for `tslint@^5.0.0`

```json
{
  "extends": ["tslint-plugin-prettier"],
  "rules": {
    "prettier": true
  }
}
```

## When to use `tslint-plugin-prettier`

#### use this package when...

- you want to run prettier as a plugin of tslint and you only want prettier to report issues in `.ts` or `.tsx` files
- Ex npm script: `"lint": "tslint -p tsconfig.json"`

#### don't use this package when...

- you want prettier to check other file types such as `.md` or `.json`.  In this case you'll need to run prettier manually as an additional step along with tslint.
- Ex npm script: `"lint": "tslint -p tsconfig.json && prettier --check \"src/**/*.{ts,tsx,js,md,json}\""`

**NOTE**: in both scenarios, it's a good idea to also use [tslint-config-prettier](https://github.com/prettier/tslint-config-prettier) to disable all prettier-related rules, so as to avoid conflicts between existed rules.

## Options

- If there is no option provided, it'll try to load [config file](https://prettier.io/docs/en/configuration.html) and/or `.editorconfig` if possible, uses Prettier's default option if not found.

  ```json
  {
    "extends": ["tslint-plugin-prettier"],
    "rules": {
      "prettier": true
    }
  }
  ```

  If you don't want to load `.editorconfig`, disable it in the third argument.

  ```json
  {
    "extends": ["tslint-plugin-prettier"],
    "rules": {
      "prettier": [true, null, { "editorconfig": false }]
    }
  }
  ```

- If you'd like to specify which config file to use, just put its path (relative to `process.cwd()`) in the second argument, the following example shows how to load the config file from `<cwd>/configs/.prettierrc`:

  ```json
  {
    "extends": ["tslint-plugin-prettier"],
    "rules": {
      "prettier": [true, "configs/.prettierrc"]
    }
  }
  ```

- If you'd like to specify options manually, just put [Prettier Options](https://prettier.io/docs/en/options.html) in the second argument, for example:

  ```json
  {
    "extends": ["tslint-plugin-prettier"],
    "rules": {
      "prettier": [true, { "singleQuote": true }]
    }
  }
  ```

## Development

```sh
# lint
yarn run lint

# build
yarn run build

# test
yarn run test
```

## Related

- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
- [tslint-config-prettier](https://github.com/prettier/tslint-config-prettier)
- [prettier-tslint](https://github.com/azz/prettier-tslint)

## License

MIT © [Ika](https://github.com/ikatyang)

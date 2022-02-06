# Auto Documentation Generator for Typescript classes/interfaces

This tool automatically generates markdown documentation for Typescript classes and interfaces.

You will get a markdown doc with attributes definition as well as a JSON example.

The attributes definition table (organized by categories) looks like this:

| Attribute     | Description                  | Type    | Accepted values           | Default value | Optional | Comment                      |
| ------------- | ---------------------------- | ------- | ------------------------- | ------------- | -------- | ---------------------------- |
| name          | First name or preferred name | string  | any                       |               | no       |                              |
| age           |                              | number  | any                       |               | no       |                              |
| gender        |                              | string  | 'female', 'male', 'other' | 'other'       | yes      |                              |
| known_account |                              | boolean | any                       | false         | no       |                              |
| email         | account login                | string  | any                       | ''            | no       | only if known_account = true |

## How to use

- Download or clone this repo
- Run `npm i`
- If you don't have typescript installed, run `npm i -g ts-node`
- Run `ts-node index.ts --path "<ABSOLUTE_PATH_TO_YOUR_FILE>" [-flags]`

**Available flags**

- `--dir/-d <DIRECTORY_NAME>`: name of the directory in which to save generated docs (default = 'docs')
- `--name/-n <FILE_NAME>`: name of the generated doc file (default = filename)
- `--imports/-i`: whether to generate definitions for classes/interfaces in imported files

**Examples**

```
ts-node index.ts -p "/Users/kagigz/dev/project/src/models/Person.ts"
```

Will generate a file `docs/Person.md` and if attributes have custom types, the custom types won't be defined.

```
ts-node index.ts -p "/Users/kagigz/dev/project/src/models/Person.ts" -d models -n person-doc -i
```

Will generate a file `models/person-doc.md` and if attributes have custom types, the custom types will be defined.

## How it works

The script looks at the defined attributes in an interface or class and generates the definitions based on an attribute's name and type.  
If a comment is above the attribute's definition, a description and paramaters are added (see _Customize ouput_ below for more information).

## Customize output

### Add Categories

By default, there is only one category for a class/interface definition. But if you want, you can segment the attributes in categories.

You can add a line like this to specify a category name:

```
/* CATEGORY NAME */
```

/!\ Once you add a category, all attributes below this declaration will be part of the category until the next category declaration. If you want only some attributes to be in a category, don't put any category declaration at the beginning.

### Specify parameters

You can add parameters by adding a comment with parenthesis above an attribute definition.

- If `optional` is mentioned, the attribute will be optional
- If `default = <value>` is mentioned, the attribute will have a default value
- The rest serves as a comment

**Examples**

- `// description (optional)` will result in an attribute that is optional
- `// description (default = 'hello')` will result in an attribute with a default value of 'hello'
- `// description (optional, default = 'hello')` will result in an attribute that is optional with a default value of 'hello'
- `// description (comment)` will result in an attribute with a comment 'comment'

## Example Result

This definition:

```
  // config ID (omit: created automatically)
  id: string
  // config display name
  name: string
  // short description, displayed when choosing a config
  description: string
  // long description, displayed in the config details (optional, default = $description)
  long_description: string
  // org for which the config is available
  org: string
  // group for which the config is available (optional, default = '')
  group: string
  // indicates if the config is available for regular users (optional, default = true)
  user_trigger: boolean

  /* INPUTS */

  // accepted inputs
  inputs: Input[]
  // for each input slug, there may or may not be a corresponding input config (optional)
  input_configs: InputConfigMap
  // slug of the input considered as starting point (optional: can be empty)
  starting_point: string

  /* EXECUTION */

  // steps to execute
  steps: Step[]
  // locale (optional, default = 'en')
  locale: 'en' | 'fr'
```

Will give [this result](docs/example.md).

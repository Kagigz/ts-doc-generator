# Config

## Definition

| Attribute        | Description                                            | Type    | Accepted values | Default value | Optional | Comment                     |
| ---------------- | ------------------------------------------------------ | ------- | --------------- | ------------- | -------- | --------------------------- |
| id               | Config ID                                              | string  | any             |               | no       | omit: created automatically |
| name             | config display name                                    | string  | any             |               | no       |                             |
| description      | short description, displayed when choosing a config    | string  | any             |               | no       |                             |
| long_description | long description, displayed in the config details      | string  | any             | $description  | yes      |                             |
| org              | client ID for which the config is available            | string  | any             |               | no       |                             |
| group            | site ID for which the config is available              | string  | any             | ''            | yes      |                             |
| user_trigger     | indicates if the config is available for regular users | boolean | any             | true          | yes      |                             |

### INPUTS

| Attribute      | Description                                                               | Type                              | Accepted values | Default value | Optional | Comment      |
| -------------- | ------------------------------------------------------------------------- | --------------------------------- | --------------- | ------------- | -------- | ------------ |
| inputs         | accepted inputs                                                           | [Input[]](#Input)                 | any             |               | no       |              |
| input_configs  | for each input slug, there may or may not be a corresponding input config | [InputConfigMap](#InputConfigMap) | any             |               | yes      |              |
| starting_point | slug of the input considered as starting point                            | string                            | any             |               | yes      | can be empty |

### EXECUTION

| Attribute | Description      | Type            | Accepted values | Default value | Optional | Comment |
| --------- | ---------------- | --------------- | --------------- | ------------- | -------- | ------- |
| steps     | steps to execute | [Step[]](#Step) | any             |               | no       |         |
| locale    | locale           | string          | 'fr', 'en'      | fr            | yes      |         |

## Sub Types Definition

### InputConfig

<a name="InputConfig"></a>

| Attribute       | Description                                                                                                | Type     | Accepted values | Default value                     | Optional | Comment               |
| --------------- | ---------------------------------------------------------------------------------------------------------- | -------- | --------------- | --------------------------------- | -------- | --------------------- |
| split           | determines if the input files should be split or not                                                       | boolean  | any             | false, only if the input is a PDF | yes      |                       |
| page_range      | indicates the page range to split the files: [a, b] where a is the first page and b the last page included | number[] | any             |                                   | no       | only if split is true |
| mapping_columns | columns renaming                                                                                           | any      | any             |                                   | yes      |                       |

### InputConfigMap

<a name="InputConfigMap"></a>

| Attribute | Description | Type                        | Accepted values | Default value | Optional | Comment |
| --------- | ----------- | --------------------------- | --------------- | ------------- | -------- | ------- |
| {{slug}}  |             | [InputConfig](#InputConfig) | any             |               |          |         |

### Input

<a name="Input"></a>

| Attribute   | Description               | Type   | Accepted values                                         | Default value | Optional | Comment                               |
| ----------- | ------------------------- | ------ | ------------------------------------------------------- | ------------- | -------- | ------------------------------------- |
| label       | display name of the input | string | any                                                     |               | no       |                                       |
| slug        | name of the input         | string | any                                                     |               | no       |                                       |
| type        | type of the input         | string | 'userInput', 'resource', 'defaultInput', 'contextInput' | userInput     | no       |                                       |
| format      | format of the input files | string | 'pdf', 'table', 'xlsheets', 'text', 'date', 'json'      |               | no       |                                       |
| resource_id | ID of the linked resource | string | any                                                     |               | no       | only if the input is of type resource |

### StepAction

<a name="StepAction"></a>

| Attribute | Description                                                                  | Type   | Accepted values | Default value | Optional | Comment |
| --------- | ---------------------------------------------------------------------------- | ------ | --------------- | ------------- | -------- | ------- |
| type      | type of the action ['format', 'rename', 'transform', 'check', ..., 'custom'] | string | any             |               | no       |         |
| params    | params for this action                                                       | any    | any             |               | no       |         |

### Step

<a name="Step"></a>

| Attribute | Description                             | Type                        | Accepted values | Default value | Optional | Comment |
| --------- | --------------------------------------- | --------------------------- | --------------- | ------------- | -------- | ------- |
| label     | display name of the step                | string                      | any             |               | no       |         |
| actions   | list of actions to perform in this step | [StepAction[]](#StepAction) | any             |               | no       |         |

## Example

```

{
  "id": "<ID>",
  "name": "<NAME>",
  "description": "<DESCRIPTION>",
  "long_description": "",
  "org": "<ORG>",
  "group": "",
  "user_trigger": true,
  "inputs": [{
    "label": "<LABEL>",
    "slug": "<SLUG>",
    "type": "userInput",
    "format": "pdf",
    "editable": true,
    "resource_id": "<RESOURCE_ID>",
  }],
  "input_configs": {
    "<SLUG>": [
      {
        "split": false,
        "page_range": [],
        "mapping_columns": {}
      }
    ]
  },
  "starting_point": "<STARTING_POINT>",
  "steps": {
    "label": "<LABEL>",
    "actions": [
      {
        "type": "<TYPE>",
        "params": {}
      }
    ]
  },
  "locale": "fr"
}

```

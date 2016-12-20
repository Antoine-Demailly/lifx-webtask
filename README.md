# Lifx Webtask

Easily manage your Lifx Bulb

## Configuration

```bash
wt create lifx-webtask.js
```

## Routes

### Index
```
GET /
```

This route just tell you if your token is config

### Authentication
```
POST /auth/:token
```

#### Params:
  - **token**: String(64)

#### Results:
  - **error**: Boolean
  - **message**: String

### Current state of the bulb
```
GET /state
```

#### Results:
  - **error**: Boolean
  - **power**: String
  - **color**: Object

### Get available states
```
GET /states
```

#### Results:
  - **error**: Boolean
  - **messages**: String
  - **states**: Array of String

### Get available colors
```
GET /colors
```

#### Results:
  - **error**: Boolean
  - **messages**: String
  - **colors**: Array of String

### Power on / off the bulb
```
PUT /power/:state
```

#### Params:
  - **state**: String => available values: "on", "off"

#### Results:
  - **error**: Boolean
  - **messages**: String

### Change bulb color (automatically power on)
```
PUT /color/:color
```

#### Params:
  - **color**: String => available values: "white", "red", "orange", "yellow", "cyan", "green", "blue", "purple" or "pink"

#### Results:
  - **error**: Boolean
  - **messages**: String

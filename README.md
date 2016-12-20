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

Params:
  - token: string 64 characters

### Current state of the bulb
```
GET /state
```

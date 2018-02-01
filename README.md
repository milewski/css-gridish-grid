# Install

```bash
npm install css-gridish-grid -D
```

## Use

```javascript
import { Gridish } from 'css-gridish-grid'

if (process.env.DEBUG) {
    const grid = new Gridish( require('../css-gridish.json') )
    grid.init()
    //grid.destroy()
}
```

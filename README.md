# css-gridish-grid

[![npm version](https://badge.fury.io/js/css-gridish-grid.svg)](https://badge.fury.io/js/css-gridish-grid)
[![npm downloads](https://img.shields.io/npm/dm/css-gridish-grid.svg)](https://www.npmjs.com/package/css-gridish-grid)
[![dependencies](https://david-dm.org/milewski/css-gridish-grid.svg)](https://www.npmjs.com/package/css-gridish-grid)

This package is a standalone version of the grid provided as an chrome extension by: https://github.com/IBM/css-gridish/ the purpose of this lib is to make the local development easier by having the grid packed locally in your project, and any one in the team can preview without any further installation.  

# Install

```bash
npm install css-gridish-grid -D
```

## Use

Recommended usage: 
If you are using webpack or rollup for instance, you can wrap your code inside a `if(TRUE|FALSE) {}` block and get the grid automatically striped out from production build using tree-shaking

```javascript
import Gridish from 'css-gridish-grid'

if (process.env.DEBUG) {
    const grid = new Gridish( require('../css-gridish.json') )
    grid.init()
    //grid.destroy()
}
```

A sample of the options that can be given on the constructor can be found in here: https://github.com/IBM/css-gridish/blob/master/examples/material/css-gridish.json

The `init()` and `destroy()` methods are for easier hookups in a HOT-RELOAD environment, this giving you the ability to dispose the grid whenever appropriated.

## License

[MIT](LICENSE) © [Rafael Milewski](LICENSE)

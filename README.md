Install:

```bash
npm install
```

To start up dev env:

```bash
npm install -g watchify
watchify -t [ babelify --presets [ es2015 babel-preset-stage-2] ] main.js -o bundle.js
```

Usage:
```javascript
const el = document.getElementById('sequence');
let highlighter = new Highlighter();

// add style
highligher.add(4, 10, { background: 'yellow' });

// add class
highlighter.add(6, 12, 'highlighted');
```
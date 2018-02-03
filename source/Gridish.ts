import { GridOptions } from './Interfaces'

export default class Gridish {

    private checker = document.createElement('div')
    private checkerStyle = document.createElement('style')
    private grid = document.createElement('div')
    private layout = document.createElement('div')

    private options: GridOptions = {
        prefix: 'bx',
        breakpoints: {
            sm: {
                breakpoint: 20,
                columns: 12,
                gutter: '1.250rem',
                margin: '5vw'
            },
            xxl: {
                breakpoint: 100,
                columns: 12,
                gutter: '1.250rem',
                margin: '5vw'
            }
        },
        extraArtboards: {
            md: 48,
            lg: 62,
            xl: 75
        },
        rem: 16,
        rowHeight: 0.5,
        rows: 30,
        paths: {
            intro: 'intro.md'
        }
    }

    private listener: (event: KeyboardEvent) => void

    constructor(options: Partial<GridOptions> = {}) {

        this.options = { ...this.options, ...options }

        this.checker.className = 'css-gridish-checker'
        this.checker.appendChild(this.checkerStyle)
        this.grid.className = 'css-gridish-checker__grid'
        this.layout.className = 'css-gridish-checker__layout'

    }

    public init() {
        document.addEventListener('keydown', this.listener = (event) => { this.toggleChecker(event) }, false)
        this.createGrid(this.options)
    }

    public destroy() {

        if (!this.listener) {
            return
        }

        document.removeEventListener('keydown', this.listener, false)
        document.body.removeChild(this.checker)
        this.grid.remove()
        this.layout.remove()
        this.listener = null

    }

    private baseStyles(): string {

        return `
            .css-gridish-checker {
                left: 0;
                height: 100vh !important;
                margin: 0 auto;
                pointer-events: none;
                position: fixed;
                right: 0;
                top: 0;
                width: 100vw !important;
                z-index: 9999;
            }

            .css-gridish-checker__grid,
            .css-gridish-checker__layout {
                height: 100%;
                position: absolute;
                width: 100%;
            }

            .css-gridish-checker__grid {
                background: linear-gradient(to right, #c0c6cd 1px, transparent 1px),
                linear-gradient(to bottom, #c0c6cd 1px, transparent 1px);
            }

            .css-gridish-checker__layout {
                box-sizing: border-box;
                display: flex;
            }

            .css-gridish-checker__layout__col {
                background: #b8c1c1;
                display: none;
                flex: 1;
                opacity: 0.75;
            }
        `

    }

    private createColumn(breakpoint: string): HTMLDivElement {
        const col = document.createElement('div')
        col.className = 'css-gridish-checker__layout__col css-gridish-checker__layout__col--' + breakpoint
        return col
    }

    private createGrid(gridConfig: GridOptions) {

        this.checkerStyle.innerHTML = this.baseStyles()
        this.grid.innerHTML = ''
        this.layout.innerHTML = ''

        const [ largestBreakpoint ] = Object.values(gridConfig.breakpoints)
            .map(breakpoint => breakpoint.breakpoint)
            .sort((a, b) => a - b)
            .slice(-1)

        this.checker.setAttribute(
            'style', `font-size: ${gridConfig.rem}px; max-width: ${largestBreakpoint}em;`
        )

        this.grid.setAttribute(
            'style', `background-size: ${gridConfig.rowHeight}rem ${gridConfig.rowHeight}rem;`
        )

        const breakpoints = Object.values(gridConfig.breakpoints).map((item, index) => {
            item.name = Object.keys(gridConfig.breakpoints)[ index ]
            return item
        }).sort((a, b) => a.breakpoint - b.breakpoint)

        let previousBreakPoint = 0
        let mediaQuery = 0

        breakpoints.forEach(({ breakpoint, columns, name, margin, gutter }, index) => {

            if (index > 0) {
                previousBreakPoint = breakpoints[ index - 1 ].columns
                mediaQuery = breakpoint
            }

            const newColumns = columns - previousBreakPoint

            for (let j = 0; j < newColumns; j++) {
                this.layout.appendChild(
                    this.createColumn(name)
                )
            }

            this.checkerStyle.innerHTML =
                this.checkerStyle.innerHTML +
                `
			@media (min-width: ${mediaQuery}rem) {
				.css-gridish-checker__layout {
						padding: 0 ${margin};
				}
				.css-gridish-checker__layout__col {
					margin: 0 ${parseInt(gutter, 10) / 2}${gutter.match(/[a-zA-Z]+/g)[ 0 ]};
				}
				.css-gridish-checker__layout__col--${name} {
					display: initial;
				}
			}
		`

        })

    }

    private toggleChecker(event: KeyboardEvent) {

        if (event.ctrlKey && event.keyCode === 71) {
            if (!this.checker.contains(this.grid)) {
                this.checker.appendChild(this.grid)
            } else {
                this.grid.remove()
            }
        }

        if (event.ctrlKey && event.keyCode === 76) {
            if (!this.checker.contains(this.layout)) {
                this.checker.appendChild(this.layout)
            } else {
                this.layout.remove()
            }
        }

        if (event.ctrlKey && (event.keyCode === 71 || event.keyCode === 76)) {
            if (this.checker.contains(this.grid) || this.checker.contains(this.layout)) {
                document.body.appendChild(this.checker)
            } else {
                document.body.removeChild(this.checker)
            }
        }

    }

}

export { Gridish }

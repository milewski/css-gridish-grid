import { AdvancedBreakPoint, BreakPoint, GridOptions } from './Interfaces'

export default class Gridish {

    private overlay: HTMLDivElement
    private styleSheet: CSSStyleSheet
    private sortedBreakPoints: AdvancedBreakPoint[] = []
    private columns: HTMLDivElement
    private rows: HTMLDivElement

    private options: Partial<GridOptions> = {
        prefix: 'grid',
        rowHeight: 2,
        breakpoints: {
            small: {
                breakpoint: 47,
                columns: 2,
                gutter: '25px',
                margin: 0
            },
            medium: {
                breakpoint: 64,
                columns: 12,
                gutter: '30px',
                margin: 0
            },
            large: {
                breakpoint: 90,
                columns: 12,
                gutter: '30px',
                margin: 0
            }
        },
        rem: 16,
        rows: 30,
        settings: {
            rows: {
                fontSize: '0.6em',
                fontFamily: 'sans-serif',
                color: 'darkturquoise',
                borderBottom: '1px solid darkturquoise'
            },
            columns: {
                borderLeft: '1px solid darkturquoise',
                borderRight: '1px solid darkturquoise',
                backgroundColor: 'rgba(0,206,209, .2)'
            }
        }
    }

    private listener: (event: KeyboardEvent) => void

    constructor(options: Partial<GridOptions> = {}) {
        this.options = { ...this.options, ...options }
    }

    public init() {

        document.addEventListener('keydown', this.listener = event => { this.toggleChecker(event) }, false)

        this.overlay = document.createElement('div')
        this.overlay.classList.add(this.options.prefix)
        this.overlay.style.height = document.body.scrollHeight + 'px'
        this.sortedBreakPoints = this.sortBreakPoints(this.options.breakpoints)

        this.styleSheet = document.head.appendChild(document.createElement('style')).sheet as CSSStyleSheet

        document.body.insertBefore(this.overlay, document.body.firstChild)

        this.createGrid()

    }

    public destroy() {

        if (!this.listener) {
            return
        }

        document.removeEventListener('keydown', this.listener, false)
        document.body.removeChild(this.overlay)
        this.columns.remove()
        this.rows.remove()
        this.listener = null

        this.columns = null
        this.rows = null

    }

    public show() {
        if (!this.overlay.contains(this.columns)) {
            this.overlay.appendChild(this.columns)
            this.overlay.appendChild(this.rows)
        }
    }

    public hide() {
        this.columns.remove()
        this.rows.remove()
    }

    private toggleChecker(event: KeyboardEvent) {
        if (event.ctrlKey && event.keyCode === 76) {
            if (!this.overlay.contains(this.columns)) {
                this.show()
            } else {
                this.hide()
            }
        }
    }

    private sortBreakPoints(breakpoints: { [key: string]: BreakPoint }): AdvancedBreakPoint[] {
        return Object
            .keys(breakpoints)
            .map(name => ({
                ...breakpoints[ name ], ...{
                    name,
                    gutter: this.parseUnit(breakpoints[ name ].gutter),
                    margin: this.parseUnit(breakpoints[ name ].margin)
                } as AdvancedBreakPoint
            }))
            .sort((a, b) => a.breakpoint - b.breakpoint)
    }

    private parseUnit(item: string | number): { value: number, unit: string } {

        const [ _, value, unit = 'px' ] = /(\d+)(\w+)?/.exec(item.toString())

        return { value: parseInt(value, 10), unit }

    }

    private createGridColumns(): HTMLDivElement {

        const container = document.createElement('div')
        const { prefix } = this.options
        container.classList.add(`${prefix}__columns`)

        const { breakpoint: largestBreakpoint } = this.sortedBreakPoints[ this.sortedBreakPoints.length - 1 ]

        this.insertRule(`.${prefix}`, {
            fontSize: this.options.rem + 'px',
            maxWidth: largestBreakpoint + 'rem',
            width: '100vw',
            margin: '0 auto',
            pointerEvents: 'none',
            position: 'absolute',
            lineHeight: 'normal',
            left: '0',
            right: '0',
            top: '0',
            zIndex: '9999'
        })
        this.insertRule(`.${prefix}__columns`, {
            display: 'flex',
            boxSizing: 'border-box',
            height: '100%',
            width: '100%',
            position: 'absolute'
        })
        this.insertRule(`.${prefix}__columns__item`, {
            ...this.options.settings.columns,
            display: 'none',
            flex: '1'
        })

        this.sortedBreakPoints.forEach(({ breakpoint, columns, margin, name, gutter }, index) => {

            const previousColumnsCount = index > 0 ? this.sortedBreakPoints[ index - 1 ].columns : 0
            const newColumns = columns - previousColumnsCount

            for (let i = 0; i < newColumns; i++) {
                container.appendChild(this.createColumn(name))
            }

            const rule = `
                  @media (min-width: ${ index > 0 ? breakpoint : 0 }rem) {
                        .${prefix}__columns {
                            padding: 0 ${ margin.value }${ margin.unit };
                        }          
                        .${prefix}__columns__item {
                            margin: 0 ${ gutter.value / 2 }${ gutter.unit };
                        }                
                        .${prefix}__columns__item.\\--${ name } {
                            display: initial;
                        }
                    }
                  `

            this.styleSheet.insertRule(rule, index)

        })

        return container

    }

    private createGridRows(): HTMLDivElement {

        const container = document.createElement('div')
        const row = document.createElement('div')
        const { prefix } = this.options

        container.classList.add(`${prefix}__rows`)
        row.classList.add(`${prefix}__row`)

        const overlayHeight = this.overlay.scrollHeight

        this.insertRule(`.${prefix}__row`, {
            ...this.options.settings.rows,
            height: this.options.rowHeight + 'rem',
            boxSizing: 'border-box',
            position: 'relative'
        })

        const { fontSize } = this.options.settings.rows

        this.insertRule(`.${prefix}__row::before, .${prefix}__row::after`, {
            content: 'attr(data-key)',
            position: 'absolute',
            width: '0',
            top: `calc(${this.options.rowHeight / 2}rem - ${fontSize})`
        })
        this.insertRule(`.${prefix}__row::before`, { left: `-${fontSize}`, direction: 'rtl' })
        this.insertRule(`.${prefix}__row::after`, { right: `-${fontSize}` })

        const fragment = document.createDocumentFragment()

        let count = Math.floor(overlayHeight / (this.options.rem * this.options.rowHeight))

        const { breakpoint: latestBreakPoint } = this.sortedBreakPoints[ this.sortedBreakPoints.length - 1 ]

        const rule = `
                  @media (max-width: ${latestBreakPoint}rem) {
                        .${prefix}__row::before {
                            left: calc(${fontSize} * 4);
                            direction: ltr;
                        }
                        .${prefix}__row::after {
                            right: calc(${fontSize} * 4);
                            direction: rtl;
                        }
                    }
                  `

        this.styleSheet.insertRule(rule, 10)

        for (let i = 0; i < count; i++) {

            const clone = row.cloneNode() as HTMLDivElement
            clone.dataset.key = ((i % this.options.rows) + 1).toString()

            fragment.appendChild(clone)

        }

        container.appendChild(fragment)

        return container

    }

    private createGrid() {
        this.columns = this.createGridColumns()
        this.rows = this.createGridRows()
    }

    private createColumn(breakpoint: string): HTMLDivElement {
        const column = document.createElement('div')
        column.classList.add(`${this.options.prefix}__columns__item`, `--${breakpoint}`)
        return column
    }

    private insertRule(name: string, style: Partial<CSSStyleDeclaration>) {
        this.styleSheet.addRule(name, this.objectToCss(style))
    }

    private objectToCss(object) {
        return Object.keys(object).map(item => `${this.camelCaseToHyphenCase(item)}: ${object[ item ]}`).join(';')
    }

    private camelCaseToHyphenCase(item) {
        return item.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
    }

}

export { Gridish }

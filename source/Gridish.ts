import { AdvancedBreakPoint, BreakPoint, GridOptions } from './Interfaces'

export default class Gridish {

    private overlay: HTMLDivElement
    private sortedBreakPoints: AdvancedBreakPoint[] = []
    private columns: HTMLDivElement
    private rows: HTMLDivElement
    private styles: HTMLStyleElement

    private options: Partial<GridOptions> = {
        prefix: 'grid',
        breakpoints: {
            small: {
                breakpoint: 47,
                columns: 2,
                gutter: '25px',
                margin: 0,
                rowHeight: 2
            },
            medium: {
                breakpoint: 64,
                columns: 12,
                gutter: '30px',
                margin: 0,
                rowHeight: 3
            },
            large: {
                breakpoint: 90,
                columns: 12,
                gutter: '30px',
                margin: 0,
                rowHeight: 4
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
        this.options = { ...this.options, ...this.convertKeysToCamelCase(options) }
    }

    private convertKeysToCamelCase(object: { [key: string]: any }) {

        const result = {}
        const replacer = result => result[ 1 ].toUpperCase()

        for (let key in object) {

            const camelCased = key.replace(/-([a-z])/g, replacer)

            if (typeof object[ key ] === 'object') {
                result[ camelCased ] = this.convertKeysToCamelCase(object[ key ])
                continue
            }

            result[ camelCased ] = object[ key ]
        }

        return result

    }

    public init() {

        document.addEventListener('keydown', this.listener = event => { this.toggleChecker(event) }, false)

        this.overlay = document.createElement('div')
        this.overlay.classList.add(this.options.prefix)
        this.overlay.style.height = document.body.getBoundingClientRect().height + 'px'
        this.overlay.style.position = 'absolute'
        this.sortedBreakPoints = this.sortBreakPoints(this.options.breakpoints)
        this.styles = document.createElement('style')

        document.body.insertBefore(this.overlay, document.body.firstChild)

        this.createGrid()

        this.overlay.appendChild(this.styles)

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
        this.styles = null

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

        const [ _, value, unit = 'rem' ] = /(\d+)(\w+)?/.exec(item.toString())

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
            width: '100%',
            margin: '0 auto',
            pointerEvents: 'none',
            position: 'absolute',
            lineHeight: 'normal',
            left: '0',
            right: '0',
            top: '1px',
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

            this.insertMedia(rule)

        })

        return container

    }

    /**
     * Very Messy :( need a huge clean up
     */
    private createGridRows(): HTMLDivElement {

        const container = document.createElement('div')
        const row = document.createElement('div')
        const { prefix } = this.options

        container.classList.add(`${prefix}__rows`)
        row.classList.add(`${prefix}__row__item`)

        const overlayHeight = this.overlay.scrollHeight

        const { fontSize } = this.options.settings.rows

        const fragment = document.createDocumentFragment()

        const { breakpoint: latestBreakPoint } = this.sortedBreakPoints[ this.sortedBreakPoints.length - 1 ]

        this.insertRule(`.${prefix}__row__item`, {
            ...this.options.settings.rows,
            boxSizing: 'border-box',
            position: 'relative',
            display: 'none'
        })

        this.insertRule(`.${prefix}__row__item::before, .${prefix}__row__item::after`, {
            content: 'attr(data-key)',
            position: 'absolute',
            width: '0'
        })

        this.insertRule(`.${prefix}__row__item::before`, { left: `-${fontSize}`, direction: 'rtl' })
        this.insertRule(`.${prefix}__row__item::after`, { right: `-${fontSize}` })

        this.sortedBreakPoints.forEach(({ breakpoint, columns, margin, name, gutter, rowHeight }, index) => {

            const rule = `
                  @media (min-width: ${ index > 0 ? breakpoint : 0 }rem) {
                        .${prefix}__row__item {
                            height: ${rowHeight}rem;
                            direction: ltr;
                        }
                        .${prefix}__row__item::before, .${prefix}__row__item::after{
                            top: calc(${rowHeight / 2}rem - ${fontSize})
                        }
                    }
                  `

            this.insertMedia(rule)

        })

        let tracker = 0
        const rows = []

        this.sortedBreakPoints.sort((a, b) => b.rowHeight - a.rowHeight).forEach(({ name, rowHeight, breakpoint }, index, array) => {

            const media = index > 0 ? `max-width: ${array[ index - 1 ].breakpoint}rem` : `min-width: 0px`

            const rule2 = `
                  @media (${media}) {
                        .${prefix}__row__item.\\--${name} {
                            display: block;
                        }
                  }
                  `

            this.insertMedia(rule2)

            const count = Math.floor(overlayHeight / (this.options.rem * rowHeight))

            const newColumns = count - tracker

            tracker = count

            for (let i = 0; i < newColumns; i++) {

                const clone = row.cloneNode() as HTMLDivElement
                clone.dataset.key = ((i % this.options.rows) + 1).toString()
                clone.classList.add(`--${name}`)

                rows.push(clone)

            }

        })

        rows.forEach(row => fragment.appendChild(row))

        const rule = `
                  @media (max-width: ${latestBreakPoint}rem) {
                        .${prefix}__row__item::before {
                            left: calc(${fontSize} * 4);
                            direction: ltr;
                        }
                        .${prefix}__row__item::after {
                            right: calc(${fontSize} * 4);
                            direction: rtl;
                        }
                    }
                  `

        this.insertMedia(rule)

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

    private insertMedia(rules: string) {
        this.styles.innerHTML += rules
    }

    private insertRule(name: string, style: Partial<CSSStyleDeclaration>) {
        this.styles.innerHTML += `${name} {${this.objectToCss(style)}}`
    }

    private objectToCss(object) {
        return Object.keys(object).map(item => `${this.camelCaseToHyphenCase(item)}: ${object[ item ]}`).join(';')
    }

    private camelCaseToHyphenCase(item) {
        return item.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
    }

}

export { Gridish }

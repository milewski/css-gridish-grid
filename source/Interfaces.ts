export type BreakPoint = {
    breakpoint: number
    columns: number
    gutter: string
    margin: number | string
}

export type AdvancedBreakPoint = BreakPoint & {
    gutter: { value: number, unit: string }
    margin: { value: number, unit: string }
    name: string
}

export interface GridOptions {
    prefix: string,
    breakpoints: {
        [key: string]: BreakPoint
    },
    rem: number,
    rowHeight: number,
    rows: number,
    settings: {
        rows: Partial<CSSStyleDeclaration>
        columns: Partial<CSSStyleDeclaration>
    }
}

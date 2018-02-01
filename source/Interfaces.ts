export type BreakPoint = {
    breakpoint: number
    columns: number
    gutter: string
    margin: string
    name?: string
}

export interface GridOptions {
    prefix: string,
    breakpoints: {
        [key: string]: BreakPoint
    },
    extraArtboards: { [key: string]: number },
    rem: number,
    rowHeight: number,
    rows: number,
    paths: {
        intro?: string
    }
}

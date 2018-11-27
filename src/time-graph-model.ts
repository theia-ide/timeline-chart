export interface TimeGraphRange {
    start: number
    end: number
}

export interface TimeGraphModel {
    id: string
    totalRange: number
    rows: TimeGraphRowModel[]
    arrows: TimeGraphArrow[]
}

export interface TimeGraphRowModel {
    id: number
    name: string
    range: TimeGraphRange
    states: TimeGraphRowElementModel[]
}

export interface TimeGraphRowElementModel {
    readonly range: TimeGraphRange
    readonly label: string
    readonly data?: {[key:string]:any}
}

export interface TimeGraphArrow {
    sourceId: number
    destinationId: number
    range: TimeGraphRange
    data?: {[key:string]:any}
}
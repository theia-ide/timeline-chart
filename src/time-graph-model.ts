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
    selected: boolean
    readonly data?: {[key:string]:any}
}

export interface TimeGraphRowElementModel {
    readonly id: string
    readonly range: TimeGraphRange
    readonly label: string
    selected: boolean
    readonly data?: {[key:string]:any}
}

export interface TimeGraphArrow {
    sourceId: number
    destinationId: number
    range: TimeGraphRange
    data?: {[key:string]:any}
}
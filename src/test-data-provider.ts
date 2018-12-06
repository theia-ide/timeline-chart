import { TimeGraphModel, TimeGraphRowModel, TimeGraphRowElementModel, TimeGraphRange } from "./time-graph-model";
import { timeGraphEntries } from "./test-entries";
import { timeGraphStates } from "./test-states";

export class TestDataProvider {

    protected totalRange: number;
    protected timeGraphEntries: object[];
    protected timeGraphRows: object[];
    protected canvasDisplayWidth: number;

    constructor(canvasDisplayWidth: number) {
        this.timeGraphEntries = timeGraphEntries.model.entries;
        this.timeGraphRows = timeGraphStates.model.rows;
        this.totalRange = 0;

        this.canvasDisplayWidth = canvasDisplayWidth;

        this.timeGraphEntries.forEach((entry: any, rowIndex: number) => {
            const row = timeGraphStates.model.rows.find(row => row.entryID === entry.id);
            if (row) {
                row.states.forEach((state: any, stateIndex: number) => {
                    if (state.value > 0) {
                        const end = state.startTime + state.duration - entry.startTime;
                        this.totalRange = end > this.totalRange ? end : this.totalRange;
                    }
                });
            }
        })
    }

    getData(viewRange?: TimeGraphRange): TimeGraphModel {
        const rows: TimeGraphRowModel[] = [];
        let resolution: number;
        resolution = viewRange ? this.canvasDisplayWidth / (viewRange.end - viewRange.start) : this.canvasDisplayWidth / this.totalRange;
        timeGraphEntries.model.entries.forEach((entry: any, rowIndex: number) => {
            const states: TimeGraphRowElementModel[] = [];
            const row = timeGraphStates.model.rows.find(row => row.entryID === entry.id);
            if (row) {
                row.states.forEach((state: any, stateIndex: number) => {
                    if (state.value > 0 && state.duration * resolution > 1) {
                        const start = state.startTime - entry.startTime;
                        const end = state.startTime + state.duration - entry.startTime;
                        if ((viewRange && ((start > viewRange.start && start < viewRange.end) || (end > viewRange.start))) || !viewRange) {
                            states.push({
                                id: 'el_' + rowIndex + '_' + stateIndex,
                                label: state.label,
                                selected: false,
                                range: { start, end },
                                data: { value: state.value }
                            });
                        }
                    }
                });
            }
            rows.push({
                id: entry.id,
                name: entry.name[0],
                range: {
                    start: 0,
                    end: entry.endTime - entry.startTime
                },
                states,
                selected: false,
                data: {
                    type: entry.type
                }
            });
        })
        return {
            id: "",
            arrows: [],
            rows,
            totalRange: this.totalRange
        }
    }
}
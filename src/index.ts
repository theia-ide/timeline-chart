import { TimeGraphAxis } from "./layer/time-graph-axis";
import { TimeGraphChart } from "./layer/time-graph-chart";
import { TimeGraphUnitController } from "./time-graph-unit-controller";
import { TimeGraphNavigator } from "./layer/time-graph-navigator";
import { TimeGraphContainer } from "./time-graph-container";
import { TimeGraphChartCursors } from "./layer/time-graph-chart-cursors";
import { TimeGraphAxisCursors } from "./layer/time-graph-axis-cursors";
// import { timeGraph } from "./test-data";
import { TimeGraphRowElementModel } from "./time-graph-model";
import { TimeGraphRowElement, TimeGraphRowElementStyle } from "./components/time-graph-row-element";
import { TestDataProvider } from "./test-data-provider";
// import { TimeGraphChartGrid } from "./layer/time-graph-chart-grid";
// import { TimeGraphVerticalScrollbar } from "./layer/time-graph-vertical-scrollbar";
// import { TimeGraphChartArrows } from "./layer/time-graph-chart-arrows";

const mainWidth = 1000; //the width for the main container and its added canvas elements. Fixed yet!
const mainHeight = 300;
const container = document.getElementById('main');
if (!container) {
    throw (`No container available.`);
}
container.innerHTML = '';
container.style.width = mainWidth + "px";

const testDataProvider = new TestDataProvider(mainWidth);
let timeGraph = testDataProvider.getData();
const unitController = new TimeGraphUnitController(timeGraph.totalRange);

const axisHTMLContainer = document.createElement('div');
axisHTMLContainer.id = 'main_axis';
container.appendChild(axisHTMLContainer);

const timeGraphAxisContainer = new TimeGraphContainer({
    height: 30,
    width: mainWidth,
    id: timeGraph.id + '_axis'
}, unitController);
axisHTMLContainer.appendChild(timeGraphAxisContainer.canvas);

const timeAxisLayer = new TimeGraphAxis('timeGraphAxis');
timeGraphAxisContainer.addLayer(timeAxisLayer);

const timeAxisCursors = new TimeGraphAxisCursors('timeGraphAxisCursors');
timeGraphAxisContainer.addLayer(timeAxisCursors);

const chartHTMLContainer = document.createElement('div');
chartHTMLContainer.id = 'main_chart';
container.appendChild(chartHTMLContainer);

const timeGraphChartContainer = new TimeGraphContainer({
    id: timeGraph.id + '_chart',
    height: mainHeight,
    width: mainWidth,
    backgroundColor: 0xFFFFFF
}, unitController);
chartHTMLContainer.appendChild(timeGraphChartContainer.canvas);

const rowHeight = 16;

// const timeGraphChartGridLayer = new TimeGraphChartGrid('timeGraphGrid', rowHeight);
// timeGraphChartContainer.addLayer(timeGraphChartGridLayer);

const timeGraphChartLayer = new TimeGraphChart('timeGraphChart');
timeGraphChartContainer.addLayer(timeGraphChartLayer);

const styleMap = new Map<string, TimeGraphRowElementStyle>();
timeGraphChartLayer.registerRowElementStyleHook((model: TimeGraphRowElementModel) => {
    const styles: TimeGraphRowElementStyle[] = [
        {
            color: 0x11ad1b,
            height: rowHeight * 0.8
        }, {
            color: 0xbc2f00,
            height: rowHeight * 0.7
        }, {
            color: 0xccbf5d,
            height: rowHeight * 0.6
        }
    ];
    let style: TimeGraphRowElementStyle | undefined = styles[0];
    if (model.data && model.data.value) {
        const val = model.data.value;
        style = styleMap.get(val);
        if (!style) {
            style = styles[(styleMap.size % styles.length)];
            styleMap.set(val, style);
        }
    }
    return {
        color: style.color,
        height: style.height,
        borderWidth: model.selected ? 1 : 0
    };
});
timeGraphChartLayer.registerRowStyleHook(row => {
    return {
        backgroundColor: row.selected ? 0xdef9fc : undefined,
        backgroundOpacity: row.selected ? 0.6 : 0
    }
})
timeGraphChartLayer.registerRowElementMouseInteractions({
    click: el => { console.log(el.model.label) }
});
let selectedElement: TimeGraphRowElement;
timeGraphChartLayer.onSelectedRowElementChanged((model) => {
    const el = timeGraphChartLayer.getElementById(model.id);
    if (el) {
        selectedElement = el;
    }
})

timeGraphChartLayer.setRowModel(timeGraph.rows, rowHeight);
unitController.onViewRangeChanged(() => {
    timeGraph = testDataProvider.getData(unitController.viewRange);
    if (selectedElement) {
        for (const row of timeGraph.rows) {
            const selEl = row.states.find(el => el.id === selectedElement.id);
            if (selEl) {
                selEl.selected = true;
                break;
            }
        }
    }
    timeGraphChartLayer.setRowModel(timeGraph.rows, rowHeight);
})

const timeGraphChartCursors = new TimeGraphChartCursors('chart-cursors');
timeGraphChartContainer.addLayer(timeGraphChartCursors);
function maybeCenterCursor() {
    const selection = unitController.selectionRange;
    const view = unitController.viewRange;
    if (selection && (selection.start < view.start || selection.start > view.end)) {
        timeGraphChartCursors.centerCursor();
    }
};
timeGraphChartCursors.onNavigateLeft(() => {
    const selectedRowIndex = selectedElement ? selectedElement.row.rowIndex : 0;
    const row = timeGraph.rows[selectedRowIndex];
    const states = row.states;
    const nextIndex = states.findIndex((rowElementModel: TimeGraphRowElementModel) => {
        const selStart = unitController.selectionRange ? unitController.selectionRange.start : 0;
        return rowElementModel.range.start >= selStart;
    });
    let newPos = 0;
    let elIndex = 0;
    if (nextIndex > 0) {
        elIndex = nextIndex - 1;
    } else if (nextIndex === -1) {
        elIndex = states.length - 1;
    }
    newPos = states[elIndex].range.start;
    unitController.selectionRange = { start: newPos, end: newPos };
    const elementToSelect = timeGraphChartLayer.getElementById(states[elIndex].id);
    if (elementToSelect) {
        maybeCenterCursor();
        timeGraphChartLayer.selectRowElement(states[elIndex]);
    }
});
timeGraphChartCursors.onNavigateRight(() => {
    const selectedRowIndex = selectedElement ? selectedElement.row.rowIndex : 0;
    const row = timeGraph.rows[selectedRowIndex];
    const states = row.states;
    const nextIndex = states.findIndex((rowElementModel: TimeGraphRowElementModel) => {
        const selStart = unitController.selectionRange ? unitController.selectionRange.start : 0;
        return rowElementModel.range.start > selStart;
    });
    if (nextIndex < states.length) {
        const newPos = states[nextIndex].range.start;
        unitController.selectionRange = { start: newPos, end: newPos };
    }
    maybeCenterCursor();
    timeGraphChartLayer.selectRowElement(states[nextIndex]);
});

const cursorReset = document.getElementById('cursor-reset');
if (cursorReset) {
    cursorReset.addEventListener('click', () => {
        timeGraphChartCursors.removeCursors();
    });
}

const naviEl = document.createElement('div');
naviEl.id = 'navi';
container.appendChild(naviEl);
const naviContainer = new TimeGraphContainer({
    width: mainWidth,
    height: 10,
    id: 'navi',
    backgroundColor: 0xeeeed9
}, unitController);
const navi = new TimeGraphNavigator('timeGraphNavigator');
naviContainer.addLayer(navi);
naviEl.appendChild(naviContainer.canvas);

// const vscrollElement = document.getElementById('main-vscroll');
// if (vscrollElement) {
//     const verticalScrollContainer = new TimeGraphContainer({
//         width: 10,
//         height: mainHeight,
//         id: 'vscroll',
//         backgroundColor: 0xeeeed9
//     }, unitController);
//     const vscroll = new TimeGraphVerticalScrollbar('timeGraphVerticalScrollbar', (timeGraph.rows.length * rowHeight));
//     verticalScrollContainer.addLayer(vscroll);
//     vscroll.onVerticalPositionChanged(ypos => {
//         timeGraphChartLayer.setRowModel(timeGraph.rows, rowHeight);
//         timeGraphChartLayer.setVerticalPositionOffset(ypos);

//     });
//     vscrollElement.appendChild(verticalScrollContainer.canvas);
// }
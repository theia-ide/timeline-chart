import { TimeGraphAxis } from "./layer/time-graph-axis";
import { TimeGraphChart } from "./layer/time-graph-chart";
import { TimeGraphUnitController } from "./time-graph-unit-controller";
import { TimeGraphNavigator } from "./layer/time-graph-navigator";
import { TimeGraphContainer } from "./time-graph-container";
import { TimeGraphChartCursors } from "./layer/time-graph-chart-cursors";
import { TimeGraphAxisCursors } from "./layer/time-graph-axis-cursors";
import { timeGraph } from "./test-data";
import { TimeGraphRowElementModel } from "./time-graph-model";
import { TimeGraphRowElement } from "./components/time-graph-row-element";
// import { TimeGraphChartArrows } from "./layer/time-graph-chart-arrows";

const container = document.getElementById('main');
if (!container) {
    throw (`No container available.`);
}
container.innerHTML = '';

const axisHTMLContainer = document.createElement('div');
axisHTMLContainer.id = 'main_axis';
container.appendChild(axisHTMLContainer);

const chartHTMLContainer = document.createElement('div');
chartHTMLContainer.id = 'main_chart';
container.appendChild(chartHTMLContainer);

const unitController = new TimeGraphUnitController(timeGraph.totalRange, { start: 10000, end: 40000 });

const timeGraphAxisContainer = new TimeGraphContainer({
    height: 30,
    width: 500,
    id: timeGraph.id + '_axis',
    backgroundColor: 0x66aa33
}, unitController);
axisHTMLContainer.appendChild(timeGraphAxisContainer.canvas);

const timeAxisLayer = new TimeGraphAxis('timeGraphAxis');
timeGraphAxisContainer.addLayer(timeAxisLayer);

const timeAxisCursors = new TimeGraphAxisCursors('timeGraphAxisCursors');
timeGraphAxisContainer.addLayer(timeAxisCursors);

const timeGraphChartContainer = new TimeGraphContainer({
    id: timeGraph.id + '_chart',
    height: 300,
    width: 500,
    backgroundColor: 0xFFFFFF
}, unitController);
chartHTMLContainer.appendChild(timeGraphChartContainer.canvas);

function getRowElementStyle(model: TimeGraphRowElementModel): { color: number, height: number } {
    if (model.data && model.data.type) {
        if (model.data.type === 'red') {
            return {
                color: 0xbc2f00,
                height: 8
            }
        } else if (model.data.type === 'yellow') {
            return {
                color: 0xccbf5d,
                height: 4
            }
        }
    }
    return {
        color: 0x11ad1b,
        height: 12
    }
}

const timeGraphChartLayer = new TimeGraphChart('timeGraphChart');
timeGraphChartContainer.addLayer(timeGraphChartLayer);
timeGraphChartLayer.registerRowElementStyleHook((model: TimeGraphRowElementModel) => {
    return getRowElementStyle(model);
});
timeGraphChartLayer.registerRowElementMouseInteractions({
    click: el => { console.log(el.model.label) }
});
let selectedElement: TimeGraphRowElement;
timeGraphChartLayer.onSelectedRowElementChanged(el => {
    if (selectedElement) {
        selectedElement.style = getRowElementStyle(selectedElement.model);
    }
    selectedElement = el;
    el.style = {
        color: 0xff0000
    }
});
const rowHeight = 20;
timeGraphChartLayer.addRows(timeGraph.rows, rowHeight);

// const timeGraphChartArrows = new TimeGraphChartArrows('chartArrows');
// timeGraphChartContainer.addLayer(timeGraphChartArrows);
// timeGraphChartArrows.addArrows(timeGraph.arrows, rowHeight);

const timeGraphChartCursors = new TimeGraphChartCursors('chart-cursors');
timeGraphChartContainer.addLayer(timeGraphChartCursors);
timeGraphChartCursors.onNavigateLeft(() => {
    const selectedRowIndex = selectedElement.row.rowIndex;
    const row = timeGraph.rows[selectedRowIndex];
    const states = row.states;
    const nextIndex = states.findIndex((rowElementModel: TimeGraphRowElementModel) => {
        return rowElementModel.range.start >= unitController.selectionRange.start;
    });
    console.log('go left', nextIndex);
    if (nextIndex > 0) {
        const newPos = states[nextIndex - 1].range.start;
        unitController.selectionRange = { start: newPos, end: newPos };
    }
});
timeGraphChartCursors.onNavigateRight(() => {
    const selectedRowIndex = selectedElement.row.rowIndex;
    const row = timeGraph.rows[selectedRowIndex];
    const states = row.states;
    const nextIndex = states.findIndex((rowElementModel: TimeGraphRowElementModel) => {
        return rowElementModel.range.start > unitController.selectionRange.start;
    });
    console.log('go right', nextIndex);
    if (nextIndex < states.length) {
        const newPos = states[nextIndex].range.start;
        unitController.selectionRange = { start: newPos, end: newPos };
    }
});

const naviEl = document.createElement('div');
naviEl.id = "navi";
document.body.appendChild(naviEl);
const naviContainer = new TimeGraphContainer({
    width: 700,
    height: 20,
    id: 'navi'
}, unitController);
naviEl.appendChild(naviContainer.canvas);
const navi = new TimeGraphNavigator('timeGraphNavigator');
naviContainer.addLayer(navi);
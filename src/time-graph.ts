import { TimeGraphAxis } from "./time-graph-axis";
import { TimeGraphChart } from "./time-graph-chart";
import { TimeGraphStateController } from "./time-graph-state-controller";
import { TimeGraphModel } from "./time-graph-model";
import { TimeGraphContainer } from "./time-graph-container";

export class TimeGraph {

    protected container?: HTMLElement;
    protected axisContainer: HTMLElement;
    protected chartContainer: HTMLElement;

    protected tgContainers: TimeGraphContainer[];

    protected _controller: TimeGraphStateController

    constructor(containerId: string, timeGraphModel: TimeGraphModel) {
        this.container = document.getElementById(containerId) || undefined;
        if (!this.container) {
            throw (`No container with id ${containerId} available.`);
        }
        this.container.innerHTML = '';

        this.axisContainer = document.createElement('div');
        this.axisContainer.id = containerId + '_axis';
        this.container.appendChild(this.axisContainer);

        this.chartContainer = document.createElement('div');
        this.chartContainer.id = containerId + '_chart';
        this.container.appendChild(this.chartContainer);

        this.tgContainers = [];

        this._controller = new TimeGraphStateController(this.container.clientWidth, timeGraphModel.range.end);

        this._controller.onZoomChanged(() => {
            this.tgContainers.map(c => c.update());
        });
        this._controller.onPositionChanged(() => {
            this.tgContainers.map(c => c.update());
        });
    }

    get controller(): TimeGraphStateController {
        return this._controller;
    }

    set timeGraphAxis(tga: TimeGraphAxis) {
        this.axisContainer.innerHTML = '';
        this.tgContainers.push(tga);
        this.axisContainer.appendChild(tga.canvas);
    }

    set timeGraphChart(tgc: TimeGraphChart) {
        this.chartContainer.innerHTML = '';
        this.tgContainers.push(tgc);
        this.chartContainer.appendChild(tgc.canvas);
    }
}
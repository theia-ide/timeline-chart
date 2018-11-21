import { TimeGraphModel } from "./time-graph-model";
import { TimeGraphAxis } from "./time-graph-axis";
import { TimeGraphChart } from "./time-graph-chart";
import { TimeGraphUnitController } from "./time-graph-unit-controller";
import { TimeGraphNavigator } from "./time-graph-navigator";

const timeGraph: TimeGraphModel = {
    id: 'test1',
    name: 'graph-test1',
    totalRange: 160000,
    rows: [
        {
            range: {
                start: 0,
                end: 12000
            },
            states: [
                {
                    label: 'state blah',
                    range: {
                        start: 10,
                        end: 100
                    }
                },
                {
                    label: 'state blah',
                    range: {
                        start: 210,
                        end: 1100
                    }
                },
                {
                    label: 'state blah',
                    range: {
                        start: 1110,
                        end: 2100
                    }
                },
                {
                    label: 'state blah',
                    range: {
                        start: 2510,
                        end: 2600
                    }
                },
                {
                    label: 'state blah',
                    range: {
                        start: 4010,
                        end: 6100
                    }
                },
                {
                    label: 'state blah',
                    range: {
                        start: 7010,
                        end: 8100
                    }
                },
                {
                    label: 'state blah',
                    range: {
                        start: 9010,
                        end: 11100
                    }
                },
            ]
        },
        {
            range: {
                start: 9000,
                end: 63000
            },
            states: [
                {
                    label: 'state1',
                    range: {
                        start: 11000,
                        end: 15000
                    }
                },
                {
                    label: 'state2',
                    range: {
                        start: 15320,
                        end: 15500
                    }
                },
                {
                    label: 'state3',
                    range: {
                        start: 26500,
                        end: 34550
                    }
                },
                {
                    label: 'state4',
                    range: {
                        start: 35650,
                        end: 46550
                    }
                },
                {
                    label: 'state5',
                    range: {
                        start: 57650,
                        end: 58455
                    }
                }
            ]
        },
        {
            range: {
                start: 21000,
                end: 39000
            },
            states: [
                {
                    label: 'state2.1',
                    range: {
                        start: 21145,
                        end: 28255
                    }
                },
                {
                    label: 'state2.2',
                    range: {
                        start: 31265,
                        end: 35275
                    }
                },
                {
                    label: 'state2.3',
                    range: {
                        start: 36865,
                        end: 38955
                    }
                }
            ]
        },
        {
            range: {
                start: 35000,
                end: 50000
            },
            states: [
                {
                    label: 'state6',
                    range: {
                        start: 35265,
                        end: 36455
                    }
                },
                {
                    label: 'state7',
                    range: {
                        start: 43265,
                        end: 46455
                    }
                },
                {
                    label: 'state8',
                    range: {
                        start: 48265,
                        end: 50000
                    }
                }
            ]
        },
        {
            range: {
                start: 45000,
                end: 90000
            },
            states: [
                {
                    label: 'state6',
                    range: {
                        start: 45265,
                        end: 46455
                    }
                },
                {
                    label: 'state7',
                    range: {
                        start: 53265,
                        end: 66455
                    }
                },
                {
                    label: 'state8',
                    range: {
                        start: 78265,
                        end: 90000
                    }
                }
            ]
        },
        {
            range: {
                start: 75000,
                end: 160000
            },
            states: [
                {
                    label: 'state6',
                    range: {
                        start: 75265,
                        end: 76455
                    }
                },
                {
                    label: 'state6',
                    range: {
                        start: 77265,
                        end: 86455
                    }
                },
                {
                    label: 'state6',
                    range: {
                        start: 100265,
                        end: 100455
                    }
                },
                {
                    label: 'state7',
                    range: {
                        start: 120265,
                        end: 126455
                    }
                },
                {
                    label: 'state8',
                    range: {
                        start: 147265,
                        end: 160000
                    }
                }
            ]
        }
    ]
}

const container = document.getElementById('main');
if (!container) {
    throw (`No container available.`);
}
container.innerHTML = '';

const axisContainer = document.createElement('div');
axisContainer.id = 'main_axis';
container.appendChild(axisContainer);

const chartContainer = document.createElement('div');
chartContainer.id = 'main_chart';
container.appendChild(chartContainer);

const controller = new TimeGraphUnitController(timeGraph.totalRange, {start: 70000, end: 80000});

const timeAxis = new TimeGraphAxis({
    id: 'timeGraphAxis',
    height: 30,
    width: 500
}, controller);
axisContainer.appendChild(timeAxis.canvas);

const timeGraphChart = new TimeGraphChart({
    id: timeGraph.id + '_chart',
    height: 300,
    width: 500
}, controller);
timeGraphChart.addRows(timeGraph.rows);
chartContainer.appendChild(timeGraphChart.canvas);

const naviEl = document.createElement('div');
naviEl.id = "navi";
document.body.appendChild(naviEl);
const navi = new TimeGraphNavigator({
    width:1200,
    height:20,
    id:'navi'
}, controller);
naviEl.appendChild(navi.canvas);

export type TestFieldId = 'test0' | 'test1' | 'test2' | 'test3' | 'test4' | 'test5' | 'test6' | 'test7' | 'test8' | 'test9';
export function tgTest(id: TestFieldId, val: string) {
    const f = document.getElementById(id);
    if (f) {
        f.innerHTML = val;
    }
}
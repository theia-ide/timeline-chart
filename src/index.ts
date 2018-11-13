import { TimeGraph } from "./time-graph";
import { TimeGraphModel } from "./time-graph-model";
import { TimeGraphAxis } from "./time-graph-axis";
import { TimeGraphChart } from "./time-graph-chart";

// const timeGraphSimple: TimeGraphModel = {
//     id: 'test1',
//     name: 'graph-test1',
//     range: {
//         start: 0,
//         end: 1000
//     },
//     rows: [
//         {
//             states: [
//                 {
//                     label: 'state1',
//                     range: {
//                         start: 0,
//                         end: 100
//                     }
//                 },
//                 {
//                     label: 'state2',
//                     range: {
//                         start: 300,
//                         end: 400
//                     }
//                 },
//                 {
//                     label: 'state3',
//                     range: {
//                         start: 600,
//                         end: 700
//                     }
//                 },
//                 {
//                     label: 'state4',
//                     range: {
//                         start: 900,
//                         end: 1000
//                     }
//                 }
//             ]
//         }
//     ]
// }
const timeGraph: TimeGraphModel = {
    id: 'test1',
    name: 'graph-test1',
    range: {
        start: 0,
        end: 6000
    },
    rows: [
        {
            states: [
                {
                    label: 'state1',
                    range: {
                        start: 0,
                        end: 50
                    }
                },
                {
                    label: 'state2',
                    range: {
                        start: 150,
                        end: 155
                    }
                },
                {
                    label: 'state3',
                    range: {
                        start: 265,
                        end: 455
                    }
                },
                {
                    label: 'state4',
                    range: {
                        start: 565,
                        end: 655
                    }
                },
                {
                    label: 'state5',
                    range: {
                        start: 765,
                        end: 1455
                    }
                },
                {
                    label: 'state6',
                    range: {
                        start: 2265,
                        end: 2455
                    }
                },
                {
                    label: 'state7',
                    range: {
                        start: 3265,
                        end: 3455
                    }
                },
                {
                    label: 'state8',
                    range: {
                        start: 4265,
                        end: 4455
                    }
                }
            ]
        },
        {
            range: {
                start: 1000,
                end: 2000
            },
            states: [
                {
                    label: 'state2.1',
                    range: {
                        start: 1145,
                        end: 1255
                    }
                },
                {
                    label: 'state2.2',
                    range: {
                        start: 1265,
                        end: 1275
                    }
                },
                {
                    label: 'state2.3',
                    range: {
                        start: 1365,
                        end: 1555
                    }
                }
            ]
        }
    ]
}

const tg = new TimeGraph('main', timeGraph);

const timeAxis = new TimeGraphAxis({
    id: 'timeGraphAxis',
    height: 30,
    width: 500
}, timeGraph.range, tg.controller);

const timeGraphChart = new TimeGraphChart({
    id: timeGraph.id + '_chart',
    height: 300,
    width: 500
}, timeGraph.range, tg.controller);
timeGraphChart.addRows(timeGraph.rows);

tg.timeGraphAxis = timeAxis;
tg.timeGraphChart = timeGraphChart;

export type TestFieldId = 'test0' | 'test1' | 'test2' | 'test3' | 'test4' | 'test5' | 'test6' | 'test7' | 'test8' | 'test9';
export function tgTest(id: TestFieldId, val: string) {
    const f = document.getElementById(id);
    if (f) {
        f.innerHTML = val;
    }
}
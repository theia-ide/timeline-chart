import { TimeGraphModel } from "./time-graph-model";

export const timeGraph: TimeGraphModel = {
    id: 'test1',
    totalRange: 160000,
    rows: [
        {
            id: 0,
            name: 'Test Row 1',
            range: {
                start: 0,
                end: 12000
            },
            states: [
                {
                    label: 'row 1 state 1',
                    range: {
                        start: 10,
                        end: 100
                    },
                    data: {
                        type: 'yellow'
                    }
                },
                {
                    label: 'row 1 state 2',
                    range: {
                        start: 210,
                        end: 1100
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 1 state 3',
                    range: {
                        start: 1110,
                        end: 2100
                    }
                },
                {
                    label: 'row 1 state 4',
                    range: {
                        start: 2510,
                        end: 2600
                    }
                },
                {
                    label: 'row 1 state 5',
                    range: {
                        start: 4010,
                        end: 6100
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 1 state 6',
                    range: {
                        start: 7010,
                        end: 8100
                    },
                    data: {
                        type: 'yellow'
                    }
                },
                {
                    label: 'row 1 state 7',
                    range: {
                        start: 9010,
                        end: 11100
                    }
                },
            ]
        },
        {
            id: 1,
            name: 'Test Row 2',
            range: {
                start: 9000,
                end: 63000
            },
            states: [
                {
                    label: 'row 2 state 1',
                    range: {
                        start: 11000,
                        end: 15000
                    },
                    data: {
                        type: "red",
                    }
                },
                {
                    label: 'row 2 state 3',
                    range: {
                        start: 15320,
                        end: 15500
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 2 state 4',
                    range: {
                        start: 26500,
                        end: 34550
                    },
                    data: {
                        type: 'yellow'
                    }
                },
                {
                    label: 'row 2 state 5',
                    range: {
                        start: 35650,
                        end: 46550
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 2 state 6',
                    range: {
                        start: 57650,
                        end: 58455
                    }
                }
            ]
        },
        {
            id: 2,
            name: 'Test Row 3',
            range: {
                start: 21000,
                end: 39000
            },
            states: [
                {
                    label: 'row 3 state 1',
                    range: {
                        start: 21145,
                        end: 28255
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 3 state 2',
                    range: {
                        start: 31265,
                        end: 35275
                    }
                },
                {
                    label: 'row 3 state 3',
                    range: {
                        start: 36865,
                        end: 38955
                    }
                }
            ]
        },
        {
            id: 3,
            name: 'Test Row 4',
            range: {
                start: 35000,
                end: 50000
            },
            states: [
                {
                    label: 'row 4 state 1',
                    range: {
                        start: 35265,
                        end: 36455
                    }
                },
                {
                    label: 'row 4 state 2',
                    range: {
                        start: 43265,
                        end: 46455
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 4 state 3',
                    range: {
                        start: 48265,
                        end: 50000
                    }
                }
            ]
        },
        {
            id: 4,
            name: 'Test Row 5',
            range: {
                start: 45000,
                end: 90000
            },
            states: [
                {
                    label: 'row 5 state 1',
                    range: {
                        start: 45265,
                        end: 46455
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 5 state 2',
                    range: {
                        start: 53265,
                        end: 66455
                    },
                    data: {
                        type: 'yellow'
                    }
                },
                {
                    label: 'row 5 state 3',
                    range: {
                        start: 78265,
                        end: 90000
                    }
                }
            ]
        },
        {
            id: 5,
            name: 'Test Row 6',
            range: {
                start: 75000,
                end: 160000
            },
            states: [
                {
                    label: 'row 6 state 1',
                    range: {
                        start: 75265,
                        end: 76455
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 6 state 2',
                    range: {
                        start: 77265,
                        end: 86455
                    }
                },
                {
                    label: 'row 6 state 3',
                    range: {
                        start: 100265,
                        end: 100455
                    },
                    data: {
                        type: 'red'
                    }
                },
                {
                    label: 'row 6 state 4',
                    range: {
                        start: 120265,
                        end: 126455
                    }
                },
                {
                    label: 'row 6 state 5',
                    range: {
                        start: 147265,
                        end: 160000
                    }
                }
            ]
        }
    ],
    arrows: [
        {
            sourceId: 1,
            destinationId: 2,
            range: {
                start: 15000,
                end: 21145
            }
        },
        {
            sourceId: 2,
            destinationId: 2,
            range: {
                start: 28255,
                end: 31265
            }
        },
        {
            sourceId: 2,
            destinationId: 1,
            range: {
                start: 35275,
                end: 35650
            }
        },
        {
            sourceId: 5,
            destinationId: 4,
            range: {
                start: 76455,
                end: 78265
            }
        },
        {
            sourceId: 4,
            destinationId: 5,
            range: {
                start: 90000,
                end: 100265
            }
        }

    ]
}
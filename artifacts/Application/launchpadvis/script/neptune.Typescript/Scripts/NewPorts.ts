const ports = {
    groups: {
        in: {
            position: "top",
            markup: [
                {
                    tagName: "circle",
                    selector: "circle",
                    className: "port-in",
                },
            ],
            attrs: {
                circle: {
                    r: 8,
                    magnet: true,
                    fill: "var(--nepHighlightColor)",
                },
            },
        },
        out: {
            position: "bottom",
            markup: [
                {
                    tagName: "circle",
                    selector: "circle",
                    className: "port-out",
                },
            ],
            attrs: {
                circle: {
                    r: 8,
                    magnet: true,
                    fill: "var(--nepHighlightColor)",
                },
            },
        },
    },
    items: [
        {
            id: "in-port",
            group: "in",
        },
        {
            id: "out-port",
            group: "out",
        },
    ],
};

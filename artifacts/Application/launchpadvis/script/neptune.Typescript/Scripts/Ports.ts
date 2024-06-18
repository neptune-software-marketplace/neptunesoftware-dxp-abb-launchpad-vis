const tilePorts = {
    groups: {
        top: {
            position: "top",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                        visibility: "hidden",
                    },
                },
            },
        },
        bottom: {
            position: "bottom",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                        visibility: "hidden",
                    },
                },
            },
        },
    },
    items: [
        {
            group: "top",
        },
        {
            group: "bottom",
        },
    ],
};
const launchpadPorts = {
    groups: {
        bottom: {
            position: "bottom",
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                        visibility: "hidden",
                    },
                },
            },
        },
    },
    items: [
        {
            group: "bottom",
        },
    ],
};
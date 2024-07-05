let Graph = null;
let Shape = null;
let Stencil = null;
let Keyboard = null;
let Hierarchy = null;
let Model = null;
let Selection = null;
let Snapline = null;

let graph = null;
let stencil = null;
let clickedSource = null;
let previousSource = null;

(async () => {
    await init();
})();

async function init() {
    //@ts-ignore
    const X6Objects = await getX6Object();
    //@ts-ignore
    const extraModules = await Modules.getModules();
    //@ts-ignore
    Keyboard = extraModules.Keyboard;
    //@ts-ignore
    Hierarchy = extraModules.Hierarchy;
    //@ts-ignore
    Selection = extraModules.Selection;
    //@ts-ignore
    Snapline = extraModules.Snapline;
    //@ts-ignore
    Graph = X6Objects.Graph;
    //@ts-ignore
    Shape = X6Objects.Shape;
    //@ts-ignore
    Stencil = X6Objects.Stencil;
    //@ts-ignore
    History = X6Objects.History;
    //@ts-ignore
    Model = X6Objects.Model;
    refreshMainPage();
    modelData.setData({
        mode: "none", // none, create, view and edit
        intial: null,
        current: null,
        changes: null,
    });
}

async function render() {
    stencil = null;

    if (graph) {
        graph.dispose();
        graph = null;
    }

    graph = new Graph({
        container: document.getElementById("graph-container")!,
        grid: true,
        mousewheel: {
            enabled: true,
        },
        panning: {
            enabled: true,
        },
        connecting: {
            router: "manhattan",
            connector: {
                name: "rounded",
                args: {
                    radius: 8,
                },
            },
            anchor: "center",
            connectionPoint: "anchor",
            allowBlank: false,
            snap: {
                radius: 20,
            },
            createEdge() {
                return new Shape.Edge({
                    attrs: {
                        line: {
                            stroke: "#A2B1C3",
                            strokeWidth: 2,
                            targetMarker: {
                                name: "block", // ellipse
                                width: 12,
                                height: 8,
                            },
                        },
                    },
                    zIndex: 0,
                    tools: [
                        {
                            name: "button-remove",
                            args: { distance: -40 },
                        },
                    ],
                });
            },
            validateConnection: function (this, args) {
                if (args.sourceCell.id === args.targetCell.id) return false;

                if (args.targetPort === "in-port" && args.sourcePort === "out-port") {
                    if (
                        args.sourceCell.store.data.shape === "launchpad" &&
                        args.targetCell.store.data.shape === "tile"
                    ) {
                        return false;
                    }

                    if (
                        args.sourceCell.store.data.shape === "tile-group" &&
                        args.targetCell.store.data.shape === "application"
                    ) {
                        return false;
                    }

                    if (
                        args.sourceCell.store.data.shape === "tile-group" &&
                        args.targetCell.store.data.shape === "tile-group"
                    ) {
                        return false;
                    }

                    if (
                        args.sourceCell.store.data.shape === "tile" &&
                        args.targetCell.store.data.shape === "tile"
                    ) {
                        return false;
                    }

                    if (
                        args.sourceCell.store.data.shape === "tile" &&
                        args.targetCell.store.data.shape === "tile-group"
                    ) {
                        return false;
                    }

                    if (
                        args.sourceCell.store.data.shape === "launchpad" &&
                        args.targetCell.store.data.shape === "application"
                    ) {
                        return false;
                    }

                    if (args.targetCell) {
                        const cellSource = graph.getCellById(args.sourceCell.id);
                        const edgesOut = graph.getConnectedEdges(cellSource);

                        let count = 0;
                        edgesOut.forEach((edge: any) => {
                            const sourceNodeId = edge.getSourceCellId();
                            const targetNodeId = edge.getTargetCellId();

                            if (
                                sourceNodeId === args.sourceCell.id &&
                                targetNodeId === args.targetCell.id
                            ) {
                                count += 1;
                            }
                        });

                        if (count > 0) {
                            return false;
                        }
                    }

                    if (
                        graph.getConnectedEdges(args.targetCell, {
                            incoming: true,
                            outgoing: false,
                        }).length >= 1
                    ) {
                        return false;
                    }

                    return true;
                }

                return false;
            },
            validateMagnet: function (this, args) {
                const isOutPort = args.magnet.classList.contains("port-out");

                if (!isOutPort) {
                    return false;
                }

                const shape = args.cell.store.data.shape;
                const nodeID = args.cell.store.data.id;
                if (shape === "tile") {
                    const node = graph.getCellById(nodeID);
                    const connectedEdges = graph.getConnectedEdges(node, {
                        incoming: false,
                        outgoing: true,
                    });
                    return connectedEdges.length === 0;
                } else {
                    return isOutPort;
                }
            },
        },
        highlighting: {
            magnetAdsorbed: {
                name: "stroke",
                args: {
                    attrs: {
                        fill: "#5F95FF",
                        stroke: "#5F95FF",
                    },
                },
            },
        },
    });
    graph
        .use(new History())
        .use(
            new Selection({
                enabled: true,
                multiple: true,
                rubberband: true,
                movable: true,
                showNodeSelectionBox: true,
                modifiers: "shift",
            })
        )
        .use(new Snapline());

    stencil = new Stencil({
        title: "",
        target: graph,
        stencilGraphWidth: 400,
        stencilGraphHeight: 300,
        collapsable: false,
        groups: [
            {
                title: "Tiles and Tiles Groups",
                name: "group1",
            },
        ],
        layoutOptions: {
            columns: 1,
            columnWidth: 180,
            rowHeight: 100,
        },
    });

    const stencilElement = document.getElementById("stencil");
    if (stencilElement.childNodes.length === 0) {
        stencilElement.appendChild(stencil.container);
    } else {
        stencilElement.textContent = "";
        stencilElement.appendChild(stencil.container);
    }

    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i += 1) {
            ports[i].style.visibility = show ? "visible" : "hidden";
        }
    };
    Graph.registerNode(
        "application",
        {
            width: 170,
            height: 60,
            attrs: {
                body: {
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "rgba(95,149,255,0.05)",
                    refWidth: 1,
                    refHeight: 1,
                },
                title: {
                    text: "Application",
                    refX: 20,
                    refY: 14,
                    fill: "rgba(0,0,0,0.85)",
                    fontSize: 18,
                    "text-anchor": "start",
                },
                text: {
                    text: "",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
                },
                metadata: {
                    id: "",
                },
                icon: {
                    xlinkHref: "/public/images/platform/bare/light/app-designer.svg",
                    refX: 100, // Adjust as needed
                    refY: -10, // Adjust as needed
                    width: 80, // Adjust as needed
                    height: 80, // Adjust as needed
                    fill: "#FF5733",
                },
            },
            markup: [
                {
                    tagName: "rect",
                    selector: "body",
                },
                {
                    tagName: "text",
                    selector: "title",
                },
                {
                    tagName: "text",
                    selector: "text",
                },
                {
                    tagName: "image",
                    selector: "icon",
                },
            ],
            ports: {
                groups: {
                    in: ports.groups.in,
                },
                items: ports.items.filter((item) => item.group === "in"),
            },
        },
        true
    );

    Graph.registerNode(
        "tile",
        {
            width: 170,
            height: 60,
            attrs: {
                body: {
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "rgba(95,149,255,0.05)",
                    refWidth: 1,
                    refHeight: 1,
                },
                title: {
                    text: "Tile",
                    refX: 20,
                    refY: 14,
                    fill: "rgba(0,0,0,0.85)",
                    fontSize: 18,
                    "text-anchor": "start",
                },
                text: {
                    text: "",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
                },
                metadata: {
                    id: "",
                },
                icon: {
                    xlinkHref: "/public/images/platform/bare/light/tile.svg",
                    refX: 100, // Adjust as needed
                    refY: -10, // Adjust as needed
                    width: 80, // Adjust as needed
                    height: 80, // Adjust as needed
                    fill: "#FF5733",
                },
            },
            markup: [
                {
                    tagName: "rect",
                    selector: "body",
                },
                {
                    tagName: "text",
                    selector: "title",
                },
                {
                    tagName: "text",
                    selector: "text",
                },
                {
                    tagName: "image",
                    selector: "icon",
                },
            ],
            ports: { ...ports },
            // ports: {
            //     groups: {
            //         in: ports.groups.in,
            //     },
            //     items: ports.items.filter((item) => item.group === "in"),
            // }, // tilePorts
        },
        true
    );

    Graph.registerNode(
        "tile-group",
        {
            width: 170,
            height: 60,
            attrs: {
                body: {
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "rgba(95,149,255,0.05)",
                    refWidth: 1,
                    refHeight: 1,
                },
                title: {
                    text: "Tile Group",
                    refX: 20,
                    refY: 14,
                    fill: "rgba(0,0,0,0.85)",
                    fontSize: 18,
                    "text-anchor": "start",
                },
                text: {
                    text: "",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
                },
                metadata: {
                    id: "",
                },
                icon: {
                    xlinkHref: "/public/images/platform/bare/light/tilegroup.svg",
                    refX: 100, // Adjust as needed
                    refY: -10, // Adjust as needed
                    width: 80, // Adjust as needed
                    height: 80, // Adjust as needed
                    fill: "#FF5733",
                },
            },
            markup: [
                {
                    tagName: "rect",
                    selector: "body",
                },
                {
                    tagName: "text",
                    selector: "title",
                },
                {
                    tagName: "text",
                    selector: "text",
                },
                {
                    tagName: "image",
                    selector: "icon",
                },
            ],
            ports: { ...ports }, // tileports
        },
        true
    );

    Graph.registerNode(
        "launchpad",
        {
            width: 170,
            height: 60,
            attrs: {
                body: {
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "rgba(95,149,255,0.05)",
                    refWidth: 1,
                    refHeight: 1,
                },
                title: {
                    text: "Launchpad",
                    refX: 20,
                    refY: 14,
                    fill: "rgba(0,0,0,0.85)",
                    fontSize: 18,
                    "text-anchor": "start",
                },
                text: {
                    text: "",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
                },
                metadata: {
                    id: "",
                },
                icon: {
                    xlinkHref: "/public/images/platform/bare/light/launchpad.svg",
                    refX: 100, // Adjust as needed
                    refY: -10, // Adjust as needed
                    width: 80, // Adjust as needed
                    height: 80, // Adjust as needed
                    fill: "#FF5733",
                },
            },
            markup: [
                {
                    tagName: "rect",
                    selector: "body",
                },
                {
                    tagName: "text",
                    selector: "title",
                },
                {
                    tagName: "text",
                    selector: "text",
                },
                {
                    tagName: "image",
                    selector: "icon",
                },
            ],
            ports: {
                groups: {
                    out: ports.groups.out,
                },
                items: ports.items.filter((item) => item.group === "out"),
            }, //launchpadPorts
        },
        true
    );

    const r2 = graph.createNode({
        shape: "tile-group",
        attrs: {
            text: {
                text: "",
            },
        },
    });
    const r1 = graph.createNode({
        shape: "tile",
        attrs: {
            text: {
                text: "",
            },
        },
    });

    const r0 = graph.createNode({
        shape: "application",
        attrs: {
            text: {
                text: "",
            },
        },
    });

    function zoom(event) {
        event.preventDefault();

        const zoomDirection = event.deltaY < 0 ? "zoom-in" : "zoom-out";
        if (zoomDirection === "zoom-in") {
            graph.zoom(0.05);
        }
        if (zoomDirection === "zoom-out") {
            graph.zoom(-0.05);
        }
    }
    const graphContainer = graph.container;
    graphContainer.onwheel = zoom;

    stencil.load([r2, r1, r0], "group1");
    addLaunchpadNode();
}

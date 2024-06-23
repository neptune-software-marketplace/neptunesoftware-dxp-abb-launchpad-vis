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

refreshMainPage();

(async () => {
    await init();
    // await render();
})();

function insertCss(css: any) {
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
}

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
    apiartifactTree();
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
            // zoomAtMousePosition: true,
            // minScale: 0.5,
            // maxScale: 3,
        },
        panning: {
            enabled: true,
            // modifiers: ["leftMouse"],
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
                            // sourceMarker: {
                            //     name: "ellipse",
                            //     width: 12,
                            //     height: 8,
                            // },
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
                        args.targetCell.store.data.shape === "launchpad"
                    ) {
                        return false;
                    }

                    return true;
                }

                return false;
            },
            validateMagnet: function (this, args) {
                return args.magnet.classList.contains("port-out");
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
        stencilGraphHeight: 180,
        collapsable: false,
        groups: [
            {
                title: "Tiles and Tiles Groups",
                name: "group1",
            },
        ],
        layoutOptions: {
            columns: 1,
            columnWidth: 190,
            rowHeight: 80,
        },
    });

    const stencilElement = document.getElementById("stencil");
    if (stencilElement.childNodes.length === 0) {
        stencilElement.appendChild(stencil.container);
    } else {
        stencilElement.textContent = '';
        stencilElement.appendChild(stencil.container);
    }

    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i += 1) {
            ports[i].style.visibility = show ? "visible" : "hidden";
        }
    };

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
                    text: "No name given",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
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
            ],
            ports: {
                groups: {
                    in: ports.groups.in,
                },
                items: ports.items.filter((item) => item.group === "in"),
            }, // tilePorts
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
                    text: "No name given",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
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
                    text: "No name given",
                    refX: 20,
                    refY: 40,
                    fontSize: 12,
                    fill: "rgba(0,0,0,0.6)",
                    "text-anchor": "start",
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

    graph.on("node:mouseenter", () => {
        const container = document.getElementById("graph-container")!;
        const ports = container.querySelectorAll(".x6-port-body") as NodeListOf<SVGElement>;
        showPorts(ports, true);
    });
    graph.on("node:mouseleave", () => {
        const container = document.getElementById("graph-container")!;
        const ports = container.querySelectorAll(".x6-port-body") as NodeListOf<SVGElement>;
        showPorts(ports, false);
    });
    graph.on("cell:click", ({ cell, node }) => {
        if (cell.isNode()) {
            Form.setVisible(true);
            if (previousSource && previousSource.hasTool("boundary")) {
                previousSource.removeTool("boundary");
            }
            clickedSource = cell;
            const nodeId = cell.id;
            const nodeShape = cell.shape;
            const nodeText = cell.attr("text/text") || "";
            // FormSetData({ id: nodeId, shape: nodeShape, name: nodeText });
            modelselectedNode.setData({ id: nodeId, shape: nodeShape, name: nodeText });
            if (!node.hasTool("boundary")) {
                node.addTools({
                    name: "boundary",
                    args: {
                        attrs: {
                            fill: "#7c68fc",
                            stroke: "#9254de",
                            strokeWidth: 1,
                            fillOpacity: 0.2,
                        },
                    },
                });
            }
            previousSource = cell;
        }
    });
    graph.on("node:mouseenter", ({ node }) => {
        if (node.store.previous.shape !== "launchpad") {
            node.addTools({
                name: "button-remove",
                args: {
                    x: 0,
                    y: 0,
                    offset: { x: 10, y: 10 },
                },
            });
        }
    });

    graph.on("node:mouseleave", ({ node }) => {
        if (node.store.previous.shape !== "launchpad") {
            node.removeTool("button-remove");
        }
    });
    graph.on("edge:mouseenter", ({ edge }) => {
        edge.addTools({
            name: "button-remove",
            args: { distance: -40 },
        });
    });
    graph.on("edge:mouseleave", ({ edge }) => {
        edge.removeTool("button-remove");
    });

    graph.on("blank:click", ({ cell, node }) => {
        if (previousSource && previousSource.hasTool("boundary")) {
            previousSource.removeTool("boundary");
        }
        previousSource = null;
        Form.setVisible(false);
        modelselectedNode.setData({ id: "", shape: "", name: "" });
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

    stencil.load([r1, r2], "group1");
    addLaunchpadNode();
}
function preWork() {
    insertCss(`
    #container {
      display: flex;
      height: calc(100%);
      border: 1px solid #dfe3e8;
    }
    #stencil {
      width: 250px;
      position: relative;
      height: calc(100%);
      border-right: 1px solid #dfe3e8;
    }
    #graph-container {
      flex-grow: 1;
      height: calc(100%) !important;
    }
    .x6-widget-stencil  {
      background-color: #fff;
    }
    .x6-widget-stencil-title {
      background-color: #fff;
    }
    .x6-widget-stencil-group-title {
      background-color: #fff !important;
    }
    .x6-widget-transform {
      margin: -1px 0 0 -1px;
      padding: 0px;
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
      border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
      background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
      background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
      border-radius: 0;
    }
    .x6-widget-selection-inner {
      border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
      opacity: 0;
    }
  `);
}
preWork();

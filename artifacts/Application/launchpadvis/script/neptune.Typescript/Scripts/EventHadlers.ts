let eventHandlers: { [key: string]: Function } = {};

function addGraphEvents() {
    if (Object.keys(eventHandlers).length > 0) return;
    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i += 1) {
            ports[i].style.visibility = show ? "visible" : "hidden";
        }
    };

    eventHandlers.nodeMouseEnter = () => {
        const container = document.getElementById("graph-container")!;
        const ports = container.querySelectorAll(".x6-port-body") as NodeListOf<SVGElement>;
        showPorts(ports, true);
    };

    eventHandlers.nodeMouseLeave = () => {
        const container = document.getElementById("graph-container")!;
        const ports = container.querySelectorAll(".x6-port-body") as NodeListOf<SVGElement>;
        showPorts(ports, false);
    };

    eventHandlers.cellClick = ({ cell, node }) => {
        if (cell.isNode()) {
            Form.setVisible(true);
            if (previousSource && previousSource.hasTool("boundary")) {
                previousSource.removeTool("boundary");
            }
            clickedSource = cell;
            const nodeId = cell.id;
            const nodeShape = cell.shape;
            const nodeText = cell.attr("text/text") || "";
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
    };

    eventHandlers.nodeMouseEnterWithNode = ({ node }) => {
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
    };

    eventHandlers.nodeMouseLeaveWithNode = ({ node }) => {
        if (node.store.previous.shape !== "launchpad") {
            node.removeTool("button-remove");
        }
    };

    eventHandlers.edgeMouseEnter = ({ edge }) => {
        edge.addTools({
            name: "button-remove",
            args: { distance: -40 },
        });
    };

    eventHandlers.edgeMouseLeave = ({ edge }) => {
        edge.removeTool("button-remove");
    };

    eventHandlers.blankClick = ({ cell, node }) => {
        if (previousSource && previousSource.hasTool("boundary")) {
            previousSource.removeTool("boundary");
        }
        previousSource = null;
        Form.setVisible(false);
        modelselectedNode.setData({ id: "", shape: "", name: "" });
    };

    graph.on("node:mouseenter", eventHandlers.nodeMouseEnter);
    graph.on("node:mouseleave", eventHandlers.nodeMouseLeave);
    graph.on("cell:click", eventHandlers.cellClick);
    graph.on("node:mouseenter", eventHandlers.nodeMouseEnterWithNode);
    graph.on("node:mouseleave", eventHandlers.nodeMouseLeaveWithNode);
    graph.on("edge:mouseenter", eventHandlers.edgeMouseEnter);
    graph.on("edge:mouseleave", eventHandlers.edgeMouseLeave);
    graph.on("blank:click", eventHandlers.blankClick);
}

function removeGraphEvents() {
    graph.off("node:mouseenter", eventHandlers.nodeMouseEnter);
    graph.off("node:mouseleave", eventHandlers.nodeMouseLeave);
    graph.off("cell:click", eventHandlers.cellClick);
    graph.off("node:mouseenter", eventHandlers.nodeMouseEnterWithNode);
    graph.off("node:mouseleave", eventHandlers.nodeMouseLeaveWithNode);
    graph.off("edge:mouseenter", eventHandlers.edgeMouseEnter);
    graph.off("edge:mouseleave", eventHandlers.edgeMouseLeave);
    graph.off("blank:click", eventHandlers.blankClick);
    eventHandlers = {};
}

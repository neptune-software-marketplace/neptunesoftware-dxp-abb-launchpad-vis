namespace Functions {
    export function addLaunchpadNode() {
        if (graph) {
            graph.addNode({
                shape: "launchpad",
            });
        }
    }

    export function centerContent() {
        if (graph) {
            graph.centerContent();
            graph.zoomToFit({
                padding: 50,
                maxScale: 2,
            });
        }
    }

    export function stencilVisibility(val) {
        const stencilDiv = document.getElementById("stencil");
        stencilDiv.style.display = val ? "block" : "none";
    }

    export function clear() {
        clickedSource = null;
        previousSource = null;
        modelSelectedNode.setData({
            nodeID: null,
            shape: null,
            name: null,
            title: null,
            description: null,
            appType: null,
            icon: null,
        });
        modelData.getData().focusedCell = false;
        modelSelectedNode.refresh();
        modelData.refresh();
        if (graph) {
            graph.clearCells();
        }
    }

    export function buildNestedStructure(nodeId: string) {
        const node = graph.getCellById(nodeId);
        if (!node) {
            return null;
        }

        const children = [];
        const connectedEdges = graph.getConnectedEdges(node);

        connectedEdges.forEach((edge: any) => {
            const source = edge.getSourceNode();
            const target = edge.getTargetNode();

            if (source && source.id === nodeId) {
                const childNode = buildNestedStructure(target.id);
                if (childNode) {
                    children.push(childNode);
                }
            }
        });

        switch (node.shape) {
            case "application":
                return {
                    id: node.id,
                    shape: node.shape,
                    name: node.attr("metadata/name"),
                    appType: node.attr("metadata/appType"),
                    artifactID: node.attr("metadata/artifactID"),
                    children: children,
                };
            case "tile":
                return {
                    id: node.id,
                    shape: node.shape,
                    name: node.attr("metadata/name"),
                    title: node.attr("metadata/title"),
                    description: node.attr("metadata/description"),
                    children: children,
                };
            case "tile-group":
                return {
                    id: node.id,
                    shape: node.shape,
                    name: node.attr("metadata/name"),
                    title: node.attr("metadata/title"),
                    description: node.attr("metadata/description"),
                    children: children,
                };
            case "launchpad":
                return {
                    id: node.id,
                    shape: node.shape,
                    name: node.attr("metadata/name"),
                    title: node.attr("metadata/title"),
                    description: node.attr("metadata/description"),
                    children: children,
                };
            default:
                break;
        }
    }

    export function graphToJSON() {
        const launchpadNode = graph.toJSON().cells.find((obj: any) => obj.shape === "launchpad");
        if (!launchpadNode) {
            return {};
        }

        return buildNestedStructure(launchpadNode.id);
    }

    export async function graphToNeptune(data: any) {
        async function processNode(node: any) {
            let childResponses = [];

            // if the node has children, process them first
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    const childResponse = await processNode(child);
                    childResponses.push(childResponse);
                }
            }

            let payload = { ...node }; // copy of the node
            if (
                (payload.shape === "tile-group" || payload.shape === "launchpad") &&
                childResponses.length > 0
            ) {
                payload.childrenResponses = childResponses;
            }
            let response: any;
            switch (payload.shape) {
                case "application":
                    break;
                case "tile":
                    const appType = payload.children[0].appType;

                    if (!payload.name || payload.name === "") {
                        return Promise.reject(`Error: The name cannot be null or an empty string for shape: ${payload.shape}.`);
                    }                    

                    const commonPayload = {
                        name: payload.name,
                        title: payload.title,
                        description: payload.description,
                        ...apiDefinitions["tile"],
                    };

                    const tilePayload = {
                        ...commonPayload,
                        actionType: appType === "application" ? "A" : "F",
                        actionApplication:
                            appType === "application" ? payload.children[0].name : null,
                        settings:
                            appType === "adaptive"
                                ? { adaptive: { id: payload.children[0].artifactID } }
                                : null,
                    };

                    response = await artifactAPI(tilePayload, "Tile", "Save");
                    response.shape = "tile";
                    break;
                case "tile-group":
                    const tilesForTilegroup = [];
                    if (childResponses.length > 0) {
                        childResponses.forEach((item) => {
                            tilesForTilegroup.push(item);
                        });
                    }

                    if (!payload.name || payload.name === "") {
                        return Promise.reject(`Error: The name cannot be null or an empty string for shape: ${payload.shape}.`);
                    }

                    const groupPayload = {
                        name: payload.name,
                        title: payload.title,
                        description: payload.description,
                        tiles: tilesForTilegroup,
                        ...apiDefinitions["tilegroup"],
                    };

                    response = await artifactAPI(groupPayload, "Category", "Save");
                    response.shape = "tile-group";
                    break;
                case "launchpad":
                    const tilegroupsForLaunch = [];
                    if (childResponses.length > 0) {
                        childResponses.forEach((tilegroup) => {
                            tilegroupsForLaunch.push(tilegroup);
                        });
                    }

                    if (!payload.name || payload.name === "") {
                        return Promise.reject(`Error: The name cannot be null or an empty string for shape: ${payload.shape}.`);
                    }

                    const launchpadPayload = {
                        name: payload.name,
                        title: payload.title,
                        description: payload.description,
                        cat: tilegroupsForLaunch,
                        ...apiDefinitions["launchpad"],
                    };

                    response = await artifactAPI(launchpadPayload, "Launchpad", "Save");

                    if (response.status) {
                        return Promise.reject(`Error: ${response.status}.`);
                    }
                    response.shape = "launchpad";
                    break;

                default:
                    console.error(`Unknown shape: ${node.shape}`);
            }

            return response;
        }

        return await processNode(data);
    }

    export async function artifactAPI(payload: any, tool: string, method: string) {
        return new Promise((resolve, reject) => {
            sap.n.Planet9.function({
                id: tool,
                method: method,
                data: payload,
                success: function (data:any) {
                    resolve(data);
                },
                error: function (er:any) {
                    console.error(er);
                    reject(er);
                },
            });
        });
    }

    // not used yet
    export function diffJson(before, after, path = "") {
        let diffs = [];

        if (
            typeof before === "object" &&
            before !== null &&
            typeof after === "object" &&
            after !== null
        ) {
            if (Array.isArray(before) && Array.isArray(after)) {
                const beforeIds = new Set(before.map((item) => item.id));
                const afterIds = new Set(after.map((item) => item.id));

                // find added items
                after.forEach((item) => {
                    if (!beforeIds.has(item.id)) {
                        diffs.push({ type: "added", path: `${path}[${item.id}]`, value: item });
                    }
                });

                // find removed items
                before.forEach((item) => {
                    if (!afterIds.has(item.id)) {
                        diffs.push({ type: "removed", path: `${path}[${item.id}]`, value: item });
                    }
                });

                // find common items and recurse
                before.forEach((item) => {
                    if (afterIds.has(item.id)) {
                        const beforeItem = before.find((i) => i.id === item.id);
                        const afterItem = after.find((i) => i.id === item.id);
                        diffs = diffs.concat(
                            diffJson(beforeItem, afterItem, `${path}[${item.id}]`)
                        );
                    }
                });
            } else {
                const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

                allKeys.forEach((key) => {
                    const newPath = path ? `${path}/${key}` : key;

                    if (!(key in before)) {
                        diffs.push({ type: "added", path: newPath, value: after[key] });
                    } else if (!(key in after)) {
                        diffs.push({ type: "removed", path: newPath, value: before[key] });
                    } else {
                        diffs = diffs.concat(diffJson(before[key], after[key], newPath));
                    }
                });
            }
        } else if (before !== after) {
            diffs.push({ type: "changed", path, before, after });
        }

        return diffs;
    }

    export function navigate(semantic: string, act: string, name: string, id: string) {
        const redirectDetails = {
            target: {
                semanticObject: semantic,
                action: act,
            },
            params: { name: name, id: id },
        };
        sap.n.HashNavigation.toExternal(redirectDetails);
    }

    export async function refreshMainPage() {
        Table.setBusy(true);
        const response = await artifactAPI({},"Launchpad","List");

        if (Array.isArray(response)) {
            modelLaunchpads.setData(response);
        } else {
            //@ts-ignore
            modelLaunchpads.setData(response.launchpad);
        }

        apiartifactTree();
    }

    export function checkBeforeCreate() {
        const nodes = graph.getNodes();

        // check 1
        const namesCondition = nodes.every((node: any) => {
            const name = node.store.data.attrs.metadata.name;
            return name && name.trim().length > 0;
        });

        // check 2
        const edgesCondition = nodes.every((node: any) => {
            switch (node.shape) {
                case "application":
                case "launchpad":
                    return graph.getConnectedEdges(node).length > 0;
                case "tile":
                case "tile-group":
                    return graph.getConnectedEdges(node).length >= 2;
                default:
                    return false;
            }
        });

        // check 3
        const requiredShapes = new Set(["application", "launchpad", "tile", "tile-group"]);
        const foundShapes = new Set();
        let applicationCount = 0;
        let tileCount = 0;

        nodes.forEach((node) => {
            if (requiredShapes.has(node.shape)) {
                foundShapes.add(node.shape);
            }
            if (node.shape === "application") {
                applicationCount++;
            }
            if (node.shape === "tile") {
                tileCount++;
            }
        });

        const shapeCondition =
            requiredShapes.size === foundShapes.size && applicationCount === tileCount;

        return {
            namesCondition: namesCondition,
            edgesCondition: edgesCondition,
            shapeCondition: shapeCondition,
        };
    }
    function getTextWidth(text: string) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        context.font = "16px Arial";

        const metrics = context.measureText(text);
        return metrics.width;
    }
    export function setSize(name: string = null, title: string = null, cell: any = null) {
        let defaultCellSize = {
            width: 180,
            height: 75,
        };
        let defaultIconSize = 100;

        if (name && cell == null) {
            if (title && title !== "") {
                const nameSize = getTextWidth(name);
                const titleSize = getTextWidth(title);

                const widthForName = (39 * nameSize + 2369) / 28;
                let widthForTitle = (725 + 13 * titleSize) / 16;

                const size = Math.max(widthForName, widthForTitle);

                if (size > defaultCellSize.width) {
                    defaultCellSize.width = size;
                    defaultIconSize = size - 78;
                } else {
                    defaultIconSize = defaultCellSize.width - 78;
                }
                return { cell: defaultCellSize, icon: defaultIconSize };
            }

            const nameSize = getTextWidth(name);

            const widthForName = (39 * nameSize + 2369) / 28;

            if (widthForName > defaultCellSize.width) {
                defaultCellSize.width = widthForName;
                defaultIconSize = widthForName - 78;
            } else {
                defaultIconSize = defaultCellSize.width - 78;
            }
            return { cell: defaultCellSize, icon: defaultIconSize };
        }

        if (cell && name == null) {
            const nodeName = cell.attr("title/text");
            const nodeTitle = cell.attr("text/text");

            const nameSize = getTextWidth(nodeName);
            const titleSize = getTextWidth(nodeTitle);

            const widthForName = (39 * nameSize + 2369) / 28;
            let widthForTitle = (725 + 13 * titleSize) / 16;

            const size = Math.max(widthForName, widthForTitle);

            if (size > defaultCellSize.width) {
                defaultCellSize.width = size;
                cell.setSize(defaultCellSize);
                cell.attr("icon/refX", size - 78);
            } else {
                cell.setSize(defaultCellSize);
                cell.attr("icon/refX", defaultCellSize.width - 78);
            }
            return;
        }
    }

    async function changeColor() {
        if (window.location.hash === "#launchpad-vis") {
            const mode = modelData.getData().mode;
            switch (mode) {
                case "view":
                    await Init.render(true);
                    const data = modelData.getData().selectedLaunchpad;
                    const json = await Transform.showUsage(
                        data.id.toLowerCase(),
                        data.name,
                        data.title,
                        data.description
                    );
                    await Transform.renderSymmetricGraph(json);
                    Events.addGraphEvents();
                    break;

                case "create":
                    let cells = graph.getCells();
                    await Init.render(true);
                    cells.forEach((cell: any) => {
                        if (cell.isNode()) {
                            cell.attr("title/fill", Init.textColor);
                            cell.attr("text/fill", Init.textColor);
                            let icon = cell.attr("icon/xlinkHref");
                            if (icon.includes("dark")) {
                                icon = icon.replace("dark", "light");
                            } else if (icon.includes("light")) {
                                icon = icon.replace("light", "dark");
                            }
                            cell.attr("icon/xlinkHref", icon);
                        } else if (cell.isEdge()) {
                            cell.attr("line/stroke", Init.textColor);
                        }
                    });
                    Events.addGraphEvents();
                    graph.resetCells(cells);
                    Functions.centerContent();
                    break;
                default:
                    await Init.render();
                    break;
            }
            if (modelData.getData().focusedCell) {
                let icon = modelSelectedNode.getData().icon;
                if (icon !== null || icon !== "") {
                    if (icon.includes("dark")) {
                        icon = icon.replace("dark", "light");
                    } else if (icon.includes("light")) {
                        icon = icon.replace("light", "dark");
                    }
                    modelSelectedNode.getData().icon = icon;
                    modelSelectedNode.refresh();
                }
            }
        } else {
            return;
        }
    }

    sap.ui.getCore().attachThemeChanged(()=>{
        changeColor();
    })
}

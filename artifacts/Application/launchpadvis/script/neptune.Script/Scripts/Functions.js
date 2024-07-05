function addLaunchpadNode() {
    if (graph) {
        graph.addNode({
            shape: "launchpad",
        });
    }
}

function centerContent() {
    if (graph) {
        graph.centerContent();
        graph.zoomToFit({
            padding: 20,
            maxScale: 2,
        });
    }
}

function stencilVisibility(val) {
    const stencilDiv = document.getElementById("stencil");
    stencilDiv.style.display = val ? "block" : "none";
}
function clear() {
    modelselectedNode.setData({ id: "", shape: "", name: "" });
    if (graph) {
        graph.clearCells();
    }
}

function buildNestedStructure(nodeId) {
    const node = graph.getCellById(nodeId);
    if (!node) {
        return null;
    }

    const children = [];
    const connectedEdges = graph.getConnectedEdges(node);

    connectedEdges.forEach((edge) => {
        const source = edge.getSourceNode();
        const target = edge.getTargetNode();

        if (source && source.id === nodeId) {
            const childNode = buildNestedStructure(target.id);
            if (childNode) {
                children.push(childNode);
            }
        }
    });

    return {
        id: node.id,
        shape: node.shape,
        name: node.attr("text/text"),
        children: children,
    };
}

function graphToJSON() {
    const launchpadNode = graph.toJSON().cells.find((obj) => obj.shape === "launchpad");
    if (!launchpadNode) {
        return {};
    }

    return buildNestedStructure(launchpadNode.id);
}

async function graphToNeptune(data) {
    async function processNode(node) {
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
            (node.shape === "tile-group" || node.shape === "launchpad") &&
            childResponses.length > 0
        ) {
            payload.childrenResponses = childResponses;
        }
        let response;
        switch (node.shape) {
            case "application":
                break;
            case "tile":
                let appName = null;

                if (node.children.length > 0) {
                    appName = node.children[0].name;
                }
                
                const tilePayload = {
                    actionType: "A",
                    storeItem: {},
                    translation: [],
                    name: payload.name,
                    tags: "",
                    navObject: "",
                    navAction: "",
                    roles: [],
                };

                if (appName !== null) {
                    tilePayload.actionApplication = appName;
                }

                response = await createTile(tilePayload);
                response.shape = "tile";
                break;
            case "tile-group":
                const tilegroupsForTilegroup = [];
                const tilesForTilegroup = [];
                if (childResponses.length > 0) {
                    childResponses.forEach((item) => {
                        item.shape === "tile-group"
                            ? tilegroupsForTilegroup.push(item)
                            : tilesForTilegroup.push(item);
                    });
                }
                const groupPayload = {
                    backgroundType: "cards",
                    backgroundColor: "",
                    translation: [],
                    configMessage: {},
                    tiles: tilesForTilegroup,
                    tilegroups: tilegroupsForTilegroup,
                    name: payload.name,
                    roles: [],
                };
                response = await createGroup(groupPayload);
                response.shape = "tile-group";
                break;
            case "launchpad":
                const tilegroupsForLaunch = [];
                if (childResponses.length > 0) {
                    childResponses.forEach((tilegroup) => {
                        tilegroupsForLaunch.push({
                            id: tilegroup.id,
                        });
                    });
                }
                const launchpadPayload = {
                    launchpadApp: "planet9_launchpad_standard",
                    enhancement: [],
                    config: {
                        showAccessibilityFocusIndicator: true,
                        enhancement: "",
                    },
                    enableNotifications: false,
                    layout: [],
                    name: payload.name,
                    extUserRoles: [],
                    extUserDepartments: [],
                    cat: tilegroupsForLaunch,
                    ui5Version: "1.108",
                    ui5Theme: "sap_horizon",
                };

                response = await createLaunchpad(launchpadPayload);
                response.shape = "launchpad";
                break;
            
            default:
                console.log(`Unknown shape: ${node.shape}`);
        }

        return response;
    }

    return await processNode(data);
}

async function createTile(payload) {
    return new Promise((resolve, reject) => {
        sap.n.Planet9.function({
            id: "Tile",
            method: "Save",
            data: payload,
            success: function (data) {
                resolve(data);
            },
            error: function (er) {
                console.error(er);
                reject(er);
            },
        });
    });
}

async function createGroup(payload) {
    return new Promise((resolve, reject) => {
        sap.n.Planet9.function({
            id: "Category",
            method: "Save",
            data: payload,
            success: function (data) {
                resolve(data);
            },
            error: function (er) {
                console.error(er);
                reject(er);
            },
        });
    });
}

async function createLaunchpad(payload) {
    return new Promise((resolve, reject) => {
        sap.n.Planet9.function({
            id: "Launchpad",
            method: "Save",
            data: payload,
            success: function (data) {
                resolve(data);
            },
            error: function (er) {
                console.error(er);
                reject(er);
            },
        });
    });
}

function diffJson(before, after, path = "") {
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
                    diffs = diffs.concat(diffJson(beforeItem, afterItem, `${path}[${item.id}]`));
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

function refreshMainPage() {
    apiartifactTree();
    $.ajax({
        url: "/api/functions/Launchpad/List",
        method: "POST",
        success: function (data) {
            modelLaunchpads.setData(data.launchpad);
        },
        error: function (er) {
            console.error(er);
        },
    });
}

function checkBeforeCreate() {
    const nodes = graph.getNodes();

    // check 1
    const namesCondition = nodes.every(node => {
        const name = node.store.data.attrs.text.text;
        return name && name.trim().length > 0;
    });

    // check 2
    const edgesCondition = nodes.every(node => {
        switch (node.shape) {
            case "application":
            case "launchpad":
                return graph.getConnectedEdges(node) > 0;
            case "tile":
            case "tile-group":
                return graph.getConnectedEdges(node) >= 2;
            default:
                return false;
        }
    });

    return {"namesCondition": namesCondition, "edgesCondition": edgesCondition}
}

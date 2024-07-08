interface HierarchyResult {
    id: number;
    x: number;
    y: number;
    shape: string;
    name: string;
    title: string | null;
    description: string | null;
    children: HierarchyResult[];
}

function showUsage(id: string, name: string, title: string, description: string) {
    const tree = [];

    getUsingTree(id, "", 0, tree);

    const preProcessedJSON = {
        id: id,
        name: name,
        shape: "launchpad",
        title: title,
        description: description,
        children: _convertFlatToNested(tree, "key", "parent"),
    };

    const neptuneGraph = processGraph(preProcessedJSON);

    const appData = modelData.getData();
    appData.intial = neptuneGraph;
    modelData.refresh();

    return neptuneGraph;
}

function processGraph(data) {
    delete data["key"];
    delete data["parent"];
    delete data["level"];
    const mapping = { objectId: "id", type: "shape" };
    Object.keys(mapping).forEach((oldKey) => {
        if (data.hasOwnProperty(oldKey)) {
            const newKey = mapping[oldKey];
            data[newKey] = data[oldKey];
            delete data[oldKey];
        }
    });
    if (data.shape === "tile_group") {
        data.shape = "tile-group";
    }
    if (data.shape === "app") {
        data.shape = "application";
    }
    if (data.children.length !== 0) {
        data.children.forEach((child) => {
            processGraph(child);
        });
    }
    return data;
}

function getUsingTree(objectId, parent, level, tree) {
    const source = modelArtifactRelations.getData().usingData.find((x) => x.objectId === objectId);
    // const sourceArtifact = modelartifactsData.getData().find((z) => z.objectId === objectId);
    // find users
    const usingTabData = source?.using.map((y: any) => {
        const artifact = modelArtifactRelations
            .getData()
            .artifactsData.find((z: any) => z.objectId === y.id);
        if (artifact) {
            return { objectId: artifact.objectId, name: artifact.name, type: artifact.type, title: artifact.title, description: artifact.description,  };
        }
    });
    if (usingTabData) {
        for (const element of usingTabData) {
            if (element) {
                const recursive = isRecursive(tree, parent, element.objectId); // tree.find(x => x.objectId === element.objectId);
                const name = recursive ? "RECURSION: " + element.name : element.name;
                const treeNode = {
                    key: crypto.randomUUID(),
                    parent: parent,
                    level: level,
                    name: name,
                    type: element.type,
                    objectId: element.objectId,
                    title: element.title,
                    description: element.description,
                };
                tree.push(treeNode);
                if (!recursive) {
                    getUsingTree(element.objectId, treeNode.key, level + 1, tree);
                }
            }
        }
    }
}

function isRecursive(tree, nodeId, objectId) {
    if (nodeId === "") {
        return false;
    }
    const node = tree.find((x) => x.key === nodeId);
    if (node.objectId === objectId) {
        return true;
    }
    return isRecursive(tree, node.parent, objectId);
}

async function renderSymmetricGraph(data) {
    await render();
    const result = Hierarchy.compactBox(data, {
        direction: "TB",
        getHeight() {
            return 100;
        },
        getWidth() {
            return 30;
        },
        getHGap() {
            return 90;
        },
        getVGap() {
            return 60;
        },
    });
    //@ts-ignore
    const model: Model.FromJSONData = { nodes: [], edges: [] };
    const traverse = (data: HierarchyResult) => {
        if (data) {
            const nodeShape = data.data.shape;
            const nodeName = data.data.name;
            const nodeSize = calculateCellSize(nodeName);

            model.nodes?.push({
                id: data.data.id, // node id and artifact id
                shape: nodeShape,
                width: nodeSize.width,
                height: nodeSize.height,
                x: data.x,
                y: data.y,
                attrs: {
                    text: {
                        text: data.data.name,
                    },
                    metadata: {
                        nodeID: data.data.id,
                        shape: nodeShape,
                        name: nodeName,
                        title: data.data.title || null,
                        description: data.data.description || null,
                    },
                },
                ports: {
                    groups: ports.groups,
                    items: ports.items.filter(
                        (item) => item.group === (nodeShape === "launchpad" ? "out" : "in")
                    ),
                },
            });
        }
        if (data.children) {
            data.children.forEach((item: HierarchyResult) => {
                model.edges.push({
                    source: { cell: data.data.id, port: "out-port" },
                    target: { cell: item.id, port: "in-port" },
                });
                traverse(item);
            });
        }
    };
    traverse(result);
    graph.fromJSON(model);
    //@ts-ignore
    centerContent();
}

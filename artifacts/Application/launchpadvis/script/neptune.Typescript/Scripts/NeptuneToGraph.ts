namespace Transform {
    export async function showUsage(id: string, name: string, title: string, description: string) {
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

        await addNodeIfActionType(neptuneGraph);

        return neptuneGraph;
    }

    async function addNodeIfActionType(node: any) {
        const newNode = {
            id: crypto.randomUUID(),
            name: "",
            shape: "",
            title: "",
            description: "",
            actionURL: null,
            actiongroup: null,
            actionWebApp: null,
            children: [],
        };

        if (node.actionType === "T") {
            const tilegroup = await Functions.artifactAPI({}, "Category", "Get");

            // @ts-ignore
            newNode.name = tilegroup.name;
            // @ts-ignore
            newNode.id = tilegroup.id;
            // @ts-ignore
            newNode.title = tilegroup.title;
            // @ts-ignore
            newNode.description = tilegroup.description;

            newNode.shape = "tile-group";
            node.children.push(newNode);
        }
        if (node.actionType === "U") {
            // @ts-ignore
            newNode.name = node.actionURL;
            // @ts-ignore
            newNode.actionURL = node.actionURL;

            newNode.shape = "dynamic";
            node.children.push(newNode);
        }
        if (node.actionType === "W") {
            // @ts-ignore
            newNode.name = (node.actionWebApp === "" || node.actionWebApp === null) ? "No selected Webapp" : node.actionWebApp;
            // @ts-ignore
            newNode.actionWebApp = (node.actionWebApp === "" || node.actionWebApp === null) ? "No selected Webapp" : node.actionWebApp;

            newNode.shape = "webapp";
            node.children.push(newNode);
        }

        if (node.shape === "launchpad") {
            const usingLaunch = modelArtifactRelations.getData().usingData.find(
                (item:any) => {
                    return item.objectId === node.id
                }
            ).using
            if (usingLaunch.length === 1) {
                const usingItem = usingLaunch[0];
                if (usingItem.type === "app") {
                    // @ts-ignore
                    newNode.name = usingItem.id;
                    newNode.shape = "application";
                    node.children.push(newNode);
                }   
            }
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach((child: any) => addNodeIfActionType(child));
        }
    }

    function processGraph(data: any) {
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
            data.children.forEach((child: any) => {
                processGraph(child);
            });
        }
        return data;
    }

    function getUsingTree(objectId: string, parent: any, level: number, tree: any) {
        const source = modelArtifactRelations
            .getData()
            .usingData.find((x) => x.objectId === objectId);

        const usingTabData = source?.using.map((y: any) => {
            const artifact = modelArtifactRelations
                .getData()
                .artifactsData.find((z: any) => z.objectId === y.id);
            if (artifact) {
                return {
                    objectId: artifact.objectId,
                    name: artifact.name,
                    type: artifact.type,
                    title: artifact.title,
                    description: artifact.description,

                    actionType: artifact.actionType,
                    actionURL: artifact.actionURL,
                    actiongroup: artifact.actiongroup,
                    actionWebApp: artifact.actionWebApp,
                };
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

                        actionType: element.actionType,
                        actionURL: element.actionURL,
                        actiongroup: element.actiongroup,
                        actionWebApp: element.actionWebApp,
                    };
                    tree.push(treeNode);
                    if (!recursive) {
                        getUsingTree(element.objectId, treeNode.key, level + 1, tree);
                    }
                }
            }
        }
    }

    function isRecursive(tree: any, nodeId: string, objectId: string) {
        if (nodeId === "") {
            return false;
        }
        const node = tree.find((x: any) => x.key === nodeId);
        if (node.objectId === objectId) {
            return true;
        }
        return isRecursive(tree, node.parent, objectId);
    }

    export async function renderSymmetricGraph(data: any) {
        const calculateSizes = (data: any) => {
            const sizes = Functions.setSize(data.name, data.title);
            data.nodeSize = sizes.cell;
            data.iconSize = sizes.icon;
            if (data.children) {
                data.children.forEach(calculateSizes);
            }
        };
        calculateSizes(data);

        await Init.render();

        const result = Hierarchy.compactBox(data, {
            direction: "TB",
            getHeight: (d: any) => d.nodeSize.height,
            getWidth: (d: any) => d.nodeSize.width,
            getHGap: () => 90,
            getVGap: () => 60,
        });

        //@ts-ignore
        const model: Model.FromJSONData = { nodes: [], edges: [] };

        const traverse = (data: HierarchyResult) => {
            if (data) {
                let nodeShape = data.data.shape;
                let nodeName = data.data.name;
                const nodeSize = data.data.nodeSize;
                const iconSize = data.data.iconSize;
                let nodeTitle = data.data.name;
                let nodeText = data.data.title;
                let appType = null;
                let icon: string;

                if (nodeShape === "application") {
                    appType = "application";
                    nodeShape = "application";
                    icon = `/public/images/platform/bare/${Init.systemTheme}/app-designer.svg`;
                } else if (nodeShape === "adaptive") {
                    appType = "adaptive";
                    nodeShape = "application";
                    icon = `/public/images/platform/bare/${Init.systemTheme}/adaptive-app-designer.svg`;
                } else if (nodeShape === "webapp") {
                    appType = "webapp";
                    nodeShape = "application";
                    icon = `/public/images/platform/bare/${Init.systemTheme}/app-editor.svg`;
                } else if (nodeShape === "dynamic") {
                    nodeTitle = "URL";
                } else {
                    icon = null;
                };

                model.nodes.push({
                    id: data.data.id, // node id and artifact id
                    shape: nodeShape,
                    width: nodeSize.width,
                    height: nodeSize.height,
                    x: data.x,
                    y: data.y,
                    attrs: {
                        title: {
                            // text
                            text: nodeTitle,
                        },
                        text: {
                            text: nodeText,
                        },
                        metadata: {
                            nodeID: data.data.id,
                            shape: nodeShape,
                            name: nodeName,
                            title: data.data.title || null,
                            description: data.data.description || null,
                            artifactID: data.data.id || null,
                            appType: appType,
                        },
                        icon: Object.assign(
                            {
                                refX: iconSize,
                            },
                            icon ? { xlinkHref: icon } : {}
                        ),
                    },
                    ports: {
                        groups: cellPorts.groups,
                        items: cellPorts.items.filter(
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
                        attrs: {
                            line: {
                                stroke: Init.textColor,
                                strokeWidth: 2,
                                targetMarker: {
                                    name: "block",
                                    width: 12,
                                    height: 8,
                                },
                            },
                        },
                    });
                    traverse(item);
                });
            }
        };
        traverse(result);
        graph.fromJSON(model);
        Functions.centerContent();
    }
}

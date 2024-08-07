const { scrapeArtifacts } = globals.Scraper;

const queryMode = "D";

const artifactTypeNames = {
    launchpad: "Launchpad",
    tile_group: "Tile Group",
    tile: "Tile",
    app: "Application",
    adaptive: "Adaptive App",
}

let artifacts = [];
let artifactLists = [];
let packages = [];
const whereUsed = [];
const using = [];
let artifactTree = [];
let timestamp = 0;

if (queryMode === "D") {
    artifacts = await scrapeArtifacts();
    if (artifacts.length > 0) {
        artifacts
            .filter((x) => x.type !== "package")
            .forEach((item) => {
                if (artifactLists[item.type]) {
                    artifactLists[item.type].push(item);
                } else {
                    artifactLists[item.type] = [item];
                }
            });
        packages = artifacts.filter((x) => x.type === "package");
        timestamp = Date.now();
    }
}
processPackages(packages);

processArtifactLists(artifactLists, "", 0, "T");

result.data = { artifactTree, whereUsed, using, timestamp };

complete();

function processPackages(packages) {
    if (packages.length === 0) {
        return;
    }
    const packageRootItem = {};
    packageRootItem.name = artifactTypeNames["package"] + " (" + packages.length + ")";
    packageRootItem.objectId = "";
    packageRootItem.type = "package";
    packageRootItem.key = uuid();
    packageRootItem.parent = "";
    packageRootItem.level = 0;
    packageRootItem.navMode = "P";
    artifactTree.push(packageRootItem);

    packages.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });

    packages.forEach((package) => {
        const packageItem = {};
        packageItem.name = package.name;
        packageItem.objectId = package.objectId;
        packageItem.type = "package";
        packageItem.key = uuid();
        packageItem.parent = packageRootItem.key;
        packageItem.level = 1;
        packageItem.navMode = "P";
        artifactTree.push(packageItem);

        const packageContentLists = [];
        package.children.forEach((item) => {
            const sourceArtifact = artifactLists[item.type].find(
                (element) => element.objectId === item.id || element.name === item.id
            );
            if (packageContentLists[item.type]) {
                packageContentLists[item.type].push(sourceArtifact);
            } else {
                packageContentLists[item.type] = [sourceArtifact];
            }
        });
        processArtifactLists(packageContentLists, packageItem.key, 2, "P");
    });
}

function processArtifactLists(artifacts, parent, level, navMode) {
    if (Object.keys(artifacts).length === 0) {
        return;
    }
    for (const type in artifacts) {
        const treeItem = {};
        treeItem.name = artifactTypeNames[type] + " (" + artifacts[type].length + " )";
        treeItem.objectId = "";
        treeItem.type = type;
        treeItem.key = uuid();
        treeItem.parent = parent;
        treeItem.level = level;
        treeItem.navMode = navMode;
        artifactTree.push(treeItem);

        artifacts[type].sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });

        if (type === "package") {
        } else {
            const artifactIds = artifacts[type].map((artifact) => {
                return { id: artifact.objectId, type: type };
            });
           
            try {
                createTree(artifactIds, treeItem.key, level + 1, navMode);
            } catch (e) {
                log.error(e);
            }
        }
    }

    
}

function createTree(sourceArray, parentId, level, navMode) {

    if (level > 30) {
        return;
    }    sourceArray.forEach((sourceItem) => {
        const sourceArtifact = artifactLists[sourceItem.type].find(
            (element) => element.objectId === sourceItem.id || element.name === sourceItem.id
        );
        if (sourceArtifact) {
            const treeItem = {};
            treeItem.name = sourceArtifact.name;
            treeItem.title = sourceArtifact.title ?? null;
            treeItem.description = sourceArtifact.description ?? null;
            treeItem.type = sourceArtifact.type;
            (treeItem.used_by = sourceArtifact.used_by?.length ?? 0), (treeItem.key = uuid());
            treeItem.objectId = sourceArtifact.objectId;
            treeItem.parent = parentId;
            treeItem.level = level;
            treeItem.navMode = navMode;

            treeItem.actionType = sourceArtifact.actionType;
            treeItem.actionURL = sourceArtifact.actionURL;
            treeItem.actiongroup = sourceArtifact.actiongroup;
            treeItem.actionWebApp = sourceArtifact.actionWebApp;
            
            artifactTree.push(treeItem);

            if (sourceArtifact.used_by) {
                whereUsed.push({
                    objectId: sourceArtifact.objectId,
                    used_by: sourceArtifact.used_by,
                });
            }

            if (sourceArtifact.using) {
                using.push({
                    objectId: sourceArtifact.objectId,
                    using: sourceArtifact.using,
                });
            }

            if (sourceArtifact.children?.length) {
                createTree(sourceArtifact.children, treeItem.key, level + 1, navMode);
            }
        }
    });
}

namespace ArtifactScraperDirect {
    type SelectInfo = string[];

    interface ChildrenExtractFn {
        propertyExtractFn: Function;
        artifactType: string;
    }

    interface UsingExtractFn {
        propertyExtractFn: Function;
        artifactType: string;
    }

    export interface ArtifactScraper {
        artifactType: string;
        repositoryName: string;
        selectInfo: SelectInfo;
        artifactMapFn: Function;
        childrenFn?: (ChildrenExtractFn | Function)[];
        usingFn?: (UsingExtractFn | Function)[];
    }

    const artifactInfoBasic: SelectInfo = ["id", "name", "description"];
    const artifactInfoPackage: SelectInfo = ["package", ...artifactInfoBasic];
    const artifactInfoTitle: SelectInfo = ["title", ...artifactInfoPackage];
    const artifactInfoLaunchpad: SelectInfo = ["startApp", ...artifactInfoTitle];
    const artifactInfoTile: SelectInfo = [
        "actionApplication",
        "settings",
        "actionType",
        ...artifactInfoTitle,
    ];
    const artifactInfoApp: SelectInfo = [
        "id",
        "package",
        "application",
        "title",
        "description",
        "objects",
    ];

    const artifactScrapers: ArtifactScraper[] = [
        {
            artifactType: "launchpad",
            repositoryName: "launchpad",
            selectInfo: artifactInfoLaunchpad,
            artifactMapFn: mapLaunchpad,
            usingFn: [
                { propertyExtractFn: (x) => x.cat, artifactType: "tile_group" },
                mapLaunchpadApp,
            ],
        },
        {
            artifactType: "tile_group",
            repositoryName: "category",
            selectInfo: artifactInfoTitle,
            artifactMapFn: mapLaunchpad,
            usingFn: [
                { propertyExtractFn: (x) => x.tilegroups, artifactType: "tile_group" },
                { propertyExtractFn: (x) => x.tiles, artifactType: "tile" },
            ],
        },
        {
            artifactType: "tile",
            repositoryName: "tile",
            selectInfo: artifactInfoTile,
            artifactMapFn: mapLaunchpad,
            usingFn: [{ propertyExtractFn: (x) => x.roles, artifactType: "role" }, mapTileChildren],
        },
        {
            artifactType: "app",
            repositoryName: "app_runtime",
            selectInfo: artifactInfoApp,
            artifactMapFn: mapApp,
            usingFn: [mapAppUsing],
        },
    ];

    let apps = [];

    complete({
        scrapeArtifacts,
    });

    function mapAppUsing(application) {
        const using = [];

        const apiObjects = application.objects.filter(
            (object) => object.fieldType === "neptune.restapi"
        );

        for (let i = 0; i < apiObjects.length; i++) {
            using.push({
                id: apiObjects[i].restOperation,
                type: "api_operation",
                parentId: apiObjects[i].restSource,
                parentType: "api",
            });
        }

        return using;
    }

    function mapApp({ id, application, package, title, description }) {
        const app = apps.find((x) => x.id === id);
        return [
            {
                type: "",
                packageId: app?.package,
                packageName: null,
                objectId: id,
                name: application,
                id: uuid(),
                parents: [package],
                children: [],
                using: [],
                used_by: [],
                title: title,
                description: description,
            },
        ];
    }

    function mapLaunchpadApp(data) {
        const using = [];

        if (data.startApp && data.startApp.length > 0) {
            using.push({ id: data.startApp, type: "app" });
        }

        return using;
    }

    function mapLaunchpad({ id, name, package, title, description }) {
        return [
            {
                type: "",
                packageId: package,
                packageName: null,
                objectId: id,
                name: name,
                id: uuid(),
                parents: [package],
                children: [],
                using: [],
                used_by: [],
                title: title,
                description: description,
            },
        ];
    }

    function mapTileChildren(data) {
        const children = [];

        const tile = data;
        if (tile.actionApplication && (tile.actionType === "A" || !tile.actionType)) {
            children.push({ id: tile.actionApplication, type: "app" });
        }
        if (tile.settings?.adaptive?.id && tile.actionType === "F") {
            children.push({ id: tile.settings.adaptive.id.toUpperCase(), type: "adaptive" });
        }
        if (tile.settings?.adaptive?.idTile) {
            children.push({ id: tile.settings.adaptive.idTile.toUpperCase(), type: "adaptive" });
        }
        /*for (const role of tile.roles) {
        children.push({id: role.id, type: "role"});
    }*/
        return children;
    }

    async function scrapeArtifacts() {
        const manager = p9.manager ? p9.manager : modules.typeorm.getConnection().manager;

        apps = await manager.find('app', { select: ["id", "package"] });

        log.info(apps);

        const allArtifacts = [];

        for (const scraper of artifactScrapers) {
            const res = await scrapeIt(scraper, manager);
            allArtifacts.push(res);
        }
        const artifactsUsingApps = ['tile'];
        // flatten array of arrays
        const final = allArtifacts.reduce((acc, x) => [...acc, ...x], []);

        final.forEach((x) => {
            if (artifactsUsingApps.includes(x.type)) {
                x.using
                    .filter((x) => x.type === "app")
                    .forEach((x) => {
                        const app = final.find((y) => y.type === "app" && y.name === x.id);
                        x.id = app?.objectId ?? x.id;
                    });
            }

            if (x.type === "package") {
                x.children.push(
                    ...final
                        .filter((y) => y.packageId === x.objectId)
                        .map((x) => ({ id: x.objectId, type: x.type }))
                );
            }

            if (x.type !== "package") {
                const checkedChildren = [];
                x.using?.forEach((child) => {
                    const childArtifact = final.find((z) => z.objectId === child.id);
                    if (childArtifact) {
                        if (x.type === "tile") {
                        }
                        childArtifact.used_by?.push({ id: x.objectId, type: x.type });
                        checkedChildren.push(child);
                    }
                });
            }
        });
        return final;
    }
    async function scrapeIt(scraper: ArtifactScraper, manager) {
        console.log(scraper.artifactType);
        try {
            const artifactData = await manager.find(scraper.repositoryName, {
                select: scraper.selectInfo,
                loadRelationIds: scraper.artifactType !== "table",
            });

            const artifacts = await artifactData
                .map(scraper.artifactMapFn)
                .flat()
                .map((x) => {
                    x.type = scraper.artifactType;
                    return x;
                });

            if (scraper.usingFn || scraper.childrenFn) {
                for (const artifact of artifactData) {
                    const targetArtifact = artifacts.find((x) => x.objectId === artifact.id);
                    if (scraper.childrenFn) {
                        const allChildren = [];
                        for (const childrenFn of scraper.childrenFn) {
                            if (childrenFn instanceof Function) {
                                allChildren.push(childrenFn(artifact));
                            } else {
                                allChildren.push(
                                    childrenFn.propertyExtractFn(artifact).map((x) => {
                                        return { id: x, type: childrenFn.artifactType };
                                    })
                                );
                            }
                        }
                        targetArtifact.children = allChildren.reduce(
                            (acc, x) => [...acc, ...x],
                            []
                        );
                    }
                    if (scraper.usingFn) {
                        const allUsing = [];
                        for (const usingFn of scraper.usingFn) {
                            if (usingFn instanceof Function) {
                                allUsing.push(usingFn(artifact));
                            } else {
                                allUsing.push(
                                    usingFn.propertyExtractFn(artifact).map((x) => {
                                        return { id: x, type: usingFn.artifactType };
                                    })
                                );
                            }
                        }

                        targetArtifact.using = allUsing.reduce((acc, x) => [...acc, ...x], []);
                    }
                }
            }
            return artifacts;
        } catch (requestError) {
            console.error(requestError);
            return [];
        }
    }
}
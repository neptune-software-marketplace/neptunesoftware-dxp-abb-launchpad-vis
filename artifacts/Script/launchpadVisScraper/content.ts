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
        "actionURL",
        "actiongroup",
        "actionWebApp",
        "settings",
        "type",
        "tileApplication",
        ...artifactInfoTitle,
    ];
    const artifactInfoAdaptive: SelectInfo = ["application", "connectorid", ...artifactInfoPackage];
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
            artifactMapFn: mapTile, // mapLaunchpad
            usingFn: [{ propertyExtractFn: (x) => x.roles, artifactType: "role" }, mapTileChildren],
        },
        {
            artifactType: "app",
            repositoryName: "app_runtime",
            selectInfo: artifactInfoApp,
            artifactMapFn: mapApp,
            usingFn: [],
        },
        {
            artifactType: "adaptive",
            repositoryName: "reports",
            selectInfo: artifactInfoAdaptive,
            artifactMapFn: mapInfoPackage,
            usingFn: [
                {
                    propertyExtractFn: (x) => {
                        return x.connectorid ? [x.connectorid] : [];
                    },
                    artifactType: "connector",
                },
            ],
        },
    ];

    let apps = [];
    const noPackageId = uuid().toUpperCase();

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

    function mapTile({ id, name, package, title, description, actionType, actionURL, actiongroup, actionWebApp }) {
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
                actionType: actionType,
                actionURL: actionURL,
                actiongroup: actiongroup,
                actionWebApp: actionWebApp,
            },
        ];
    }

    function mapTileChildren(data) {
        const children = [];

        const tile = data;

        if (tile.type != null && tile.type !== "") {
            if (tile.type === "application") {
                children.push({
                    id: tile.tileApplication,
                    type: "app",
                });
            }
            if (tile.type === "adaptive") {
                children.push({
                    id: tile.settings.adaptive.idTile.toLowerCase(),
                    type: "adaptive",
                });
            }
        } else {
            if (tile.actionApplication && (!tile.actionType || tile.actionType === "A")) {
                children.push({ id: tile.actionApplication, type: "app" });
            }
            if (tile.settings?.adaptive?.id && tile.actionType === "F") {
                children.push({ id: tile.settings.adaptive.id.toLowerCase(), type: "adaptive" });
            }
        }

        return children;
    }

    function mapInfoPackage({ id, name, package, description }) {
        return [
            {
                type: "",
                packageId: package ?? noPackageId,
                packageName: null,
                objectId: id,
                name: name,
                id: uuid(),
                parents: [package],
                children: [],
                using: [],
                used_by: [],
                description: description,
            },
        ];
    }

    export async function scrapeArtifacts() {
        const manager = p9.manager ? p9.manager : modules.typeorm.getConnection().manager;

        apps = await manager.find("app", { select: ["id", "package"] });

        const allArtifacts = [];

        for (const scraper of artifactScrapers) {
            const res = await scrapeIt(scraper, manager);
            allArtifacts.push(res);
        }

        const artifactsUsingApps = ["tile"];
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
                        .map((x) => ({ id: x.objectId.toLowerCase(), type: x.type }))
                );
            }

            if (x.type !== "package") {
                const checkedChildren = [];
                x.using?.forEach((child) => {
                    const childArtifact = final.find((z) => z.objectId === child.id);
                    if (childArtifact) {
                        if (x.type === "tile") {
                        }
                        childArtifact.used_by?.push({ id: x.objectId.toLowerCase(), type: x.type });
                        checkedChildren.push(child);
                    }
                });
            }
        });
        return final;
    }
    async function scrapeIt(scraper: ArtifactScraper, manager) {
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
                    x.objectId = x.objectId.toLowerCase();
                    return x;
                });
            if (scraper.usingFn || scraper.childrenFn) {
                for (const artifact of artifactData) {
                    const targetArtifact = artifacts.find(
                        (x) => x.objectId === artifact.id.toLowerCase()
                    );
                    if (scraper.childrenFn) {
                        const allChildren = [];
                        for (const childrenFn of scraper.childrenFn) {
                            if (childrenFn instanceof Function) {
                                allChildren.push(
                                    childrenFn(artifact).map((x: any) => {
                                        x.id = x.id.toLowerCase();
                                        return x;
                                    })
                                );
                            } else {
                                allChildren.push(
                                    childrenFn.propertyExtractFn(artifact).map((x) => {
                                        return {
                                            id: x.toLowerCase(),
                                            type: childrenFn.artifactType,
                                        };
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
                                allUsing.push(
                                    usingFn(artifact).map((x: any) => {
                                        x.id = x.id.toLowerCase();
                                        return x;
                                    })
                                );
                            } else {
                                allUsing.push(
                                    usingFn.propertyExtractFn(artifact).map((x: any) => {
                                        return { id: x.toLowerCase(), type: usingFn.artifactType };
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
            log.error(requestError);
            return [];
        }
    }
}

const scrapeArtifacts = ArtifactScraperDirect.scrapeArtifacts;
complete({
    scrapeArtifacts,
});
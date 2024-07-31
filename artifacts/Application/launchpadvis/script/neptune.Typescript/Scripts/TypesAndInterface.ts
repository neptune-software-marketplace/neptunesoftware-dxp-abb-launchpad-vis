interface PortMarkup {
    tagName: string;
    selector: string;
    className: string;
}

interface PortAttrs {
    circle: {
        r: number;
        magnet: boolean;
        fill: string;
    };
}

interface PortGroup {
    position: string;
    markup: PortMarkup[];
    attrs: PortAttrs;
}

interface PortItem {
    id: string;
    group: string;
}

interface Ports {
    groups: {
        in: PortGroup;
        out: PortGroup;
    };
    items: PortItem[];
}

interface X6Object {
    Graph: any;
    Shape: any;
    Stencil: any;
    History: any;
    Model: any;
}

interface ExtraModules {
    Keyboard: any;
    Hierarchy: any;
    Selection: any;
    Snapline: any;
}

interface TileConfig {
    translation: any[];
    storeItem: Record<string, any>;
    categoryID: string | null;
    sort: string | null;
    urlApplication: string | null;
    actionParameters: string | null;
    actionURL: string | null;
    openDialog: boolean;
    openWindow: boolean;
    openFullscreen: boolean;
    forceRow: boolean;
    frameType: string | null;
    type: string | null;
    image: string | null;
    icon: string | null;
    backgroundType: string | null;
    backgroundColor: string | null;
    backgroundShade: string | null;
    tileApplication: string | null;
    hideHeaderL: string | null;
    hideHeaderM: boolean;
    hideHeaderS: boolean;
    hideTileDesktop: boolean;
    hideTileMobile: boolean;
    hideTileTablet: boolean;
    enableDocumentation: boolean;
    navObject: string;
    navAction: string;
    dialogWidth: string | null;
    dialogHeight: string | null;
    tileApplicationStyleClass: string | null;
    sidepanelApp: string | null;
    sidepanelTitle: string | null;
    tags: string;
    actiongroup: string | null;
    styleClass: string | null;
    titleAlignment: string | null;
    titleLevel: string | null;
    dataUrl: string | null;
    dataInterval: string | null;
    footer: string | null;
    browserBlockWin: string | null;
    browserBlockMac: string | null;
    blackoutEnabled: boolean;
    blackoutText: string | null;
    blackoutDescription: string | null;
    helpText: string | null;
    helpEnabled: boolean;
    openClickTile: boolean;
    actionWebApp: string | null;
    cardWidth: string | null;
    cardHeight: string | null;
    cardHeightFit: boolean;
    cardImage: string | null;
    cardButtonIcon: string | null;
    cardButtonIconOnly: boolean;
    imagePlacement: string | null;
    imageRepeat: string | null;
    imageSize: string | null;
    imagePosition: string | null;
    openText: string | null;
    imageHeight: string | null;
    bodyHeight: string | null;
    roleTag: string | null;
    sapICFNode: string | null;
    cockpitTile: string | null;
    package: string | null;
    roles: any[];
}

interface TileGroupConfig {
    translation: any[];
    configMessage: Record<string, any>;
    titleAlignment: string | null;
    enableFullScreen: boolean | null;
    hideHeader: boolean | null;
    backgroundType: string;
    backgroundColor: string;
    backgroundShade: string | null;
    type: string | null;
    image: string | null;
    icon: string | null;
    sort: string | null;
    inclFav: boolean;
    styleClass: string | null;
    enableScroll: boolean;
    enableShadeCalc: boolean;
    numTiles: number | null;
    enableMessage: boolean;
    headColor: string | null;
    headTxtClr: string | null;
    subheadTxtClr: string | null;
    headBorderClr: string | null;
    headBorderWidth: number | null;
    imageTablet: string | null;
    imageMobile: string | null;
    imageCover: boolean;
    imageTabletCover: boolean;
    imageMobileCover: boolean;
    imageMobileHeight: string | null;
    imageTabletHeight: string | null;
    imageHeight: string | null;
    cardContentWidth: string | null;
    cardContentAlign: string | null;
    cardPerRow: number | null;
    cardStyle: string | null;
    cardHeightFit: boolean;
    imagePlacement: string | null;
    imageRepeat: string | null;
    imageSize: string | null;
    imageTabletPlacement: string | null;
    imageTabletRepeat: string | null;
    imageTabletSize: string | null;
    imageMobilePlacement: string | null;
    imageMobileRepeat: string | null;
    imageMobileSize: string | null;
    hideFromMenu: boolean;
    roleTag: string | null;
    cockpitTileGroup: string | null;
    package: string | null;
    roles: any[];
    pad: any[];
    tilegroups: any[];
}

interface LaunchpadConfig {
    launchpadApp: string;
    extUserRoles: any[];
    extUserDepartments: any[];
    layout: any[];
    config: { showAccessibilityFocusIndicator: boolean; enhancement: string };
    enhancement: any[];
    startApp: string | null;
    startWebApp: string | null;
    customLogo: string | null;
    hideSidemenu: boolean;
    ui5Version: string;
    ui5Url: string | null;
    ui5Theme: string;
    header: string;
    customTheme: string | null;
    isExternal: string | null;
    emailPattern: string | null;
    loginApp: string | null;
    enableNotifications: boolean;
    firebaseProjectId: string | null;
    firebaseAppId: string | null;
    defaultLoginIDP: string | null;
    publicAccess: boolean;
    css: string | null;
    clientRequestTimeout: number;
    limitWidth: boolean;
    searchBackgroundType: string | null;
    searchBackgroundColor: string | null;
    searchBackgroundShade: string | null;
    usedBackgroundType: string | null;
    usedBackgroundColor: string | null;
    usedBackgroundShade: string | null;
    searchEnableShadeCalc: string | null;
    usedEnableShadeCalc: string | null;
    enableTrace: boolean;
    pwa_enable: boolean;
    pwa_customImageIos: string | null;
    pwa_customImageAndroidOld: string | null;
    pwa_customImageAndroidNew: string | null;
    pwa_displayMode: string | null;
    pwa_themeColor: string | null;
    pwa_backgroundColor: string | null;
    passwordResetEmail: string | null;
    activationCodeEmail: string | null;
    package: string | null;
}
interface NodeSize {
    width: number;
    height: number;
}
interface HierarchyResult {
    id: number;
    x: number;
    y: number;
    shape: string;
    name: string;
    title: string | null;
    description: string | null;
    children: HierarchyResult[];
    data: {
        id: string;
        shape: string;
        name: string;
        title?: string | null;
        description?: string | null;
        nodeSize: NodeSize;
        iconSize: number;
    };
}

const cellPorts: Ports = {
    groups: {
        in: {
            position: "top",
            markup: [
                {
                    tagName: "circle",
                    selector: "circle",
                    className: "port-in",
                },
            ],
            attrs: {
                circle: {
                    r: 8,
                    magnet: true,
                    fill: "var(--nepHighlightColor)",
                },
            },
        },
        out: {
            position: "bottom",
            markup: [
                {
                    tagName: "circle",
                    selector: "circle",
                    className: "port-out",
                },
            ],
            attrs: {
                circle: {
                    r: 8,
                    magnet: true,
                    fill: "var(--nepHighlightColor)",
                },
            },
        },
    },
    items: [
        {
            id: "in-port",
            group: "in",
        },
        {
            id: "out-port",
            group: "out",
        },
    ],
};

const apiDefinitions: {
    tile: TileConfig;
    tilegroup: TileGroupConfig;
    launchpad: LaunchpadConfig;
} = {
    tile: {
        translation: [],
        storeItem: {},
        categoryID: null,
        sort: null,
        urlApplication: null,
        actionParameters: null,
        actionURL: null,
        openDialog: false,
        openWindow: false,
        openFullscreen: false,
        forceRow: false,
        frameType: null,
        type: null,
        image: null,
        icon: null,
        backgroundType: null,
        backgroundColor: null,
        backgroundShade: null,
        tileApplication: null,
        hideHeaderL: null,
        hideHeaderM: false,
        hideHeaderS: false,
        hideTileDesktop: false,
        hideTileMobile: false,
        hideTileTablet: false,
        enableDocumentation: false,
        navObject: "",
        navAction: "",
        dialogWidth: null,
        dialogHeight: null,
        tileApplicationStyleClass: null,
        sidepanelApp: null,
        sidepanelTitle: null,
        tags: "",
        actiongroup: null,
        styleClass: null,
        titleAlignment: null,
        titleLevel: null,
        dataUrl: null,
        dataInterval: null,
        footer: null,
        browserBlockWin: null,
        browserBlockMac: null,
        blackoutEnabled: false,
        blackoutText: null,
        blackoutDescription: null,
        helpText: null,
        helpEnabled: false,
        openClickTile: false,
        actionWebApp: null,
        cardWidth: null,
        cardHeight: null,
        cardHeightFit: false,
        cardImage: null,
        cardButtonIcon: null,
        cardButtonIconOnly: false,
        imagePlacement: null,
        imageRepeat: null,
        imageSize: null,
        imagePosition: null,
        openText: null,
        imageHeight: null,
        bodyHeight: null,
        roleTag: null,
        sapICFNode: null,
        cockpitTile: null,
        package: null,
        roles: [],
    },
    tilegroup: {
        translation: [],
        configMessage: {},
        titleAlignment: null,
        enableFullScreen: null,
        hideHeader: null,
        backgroundType: "cards",
        backgroundColor: "",
        backgroundShade: null,
        type: null,
        image: null,
        icon: null,
        sort: null,
        inclFav: false,
        styleClass: null,
        enableScroll: false,
        enableShadeCalc: false,
        numTiles: null,
        enableMessage: false,
        headColor: null,
        headTxtClr: null,
        subheadTxtClr: null,
        headBorderClr: null,
        headBorderWidth: null,
        imageTablet: null,
        imageMobile: null,
        imageCover: false,
        imageTabletCover: false,
        imageMobileCover: false,
        imageMobileHeight: null,
        imageTabletHeight: null,
        imageHeight: null,
        cardContentWidth: null,
        cardContentAlign: null,
        cardPerRow: null,
        cardStyle: null,
        cardHeightFit: false,
        imagePlacement: null,
        imageRepeat: null,
        imageSize: null,
        imageTabletPlacement: null,
        imageTabletRepeat: null,
        imageTabletSize: null,
        imageMobilePlacement: null,
        imageMobileRepeat: null,
        imageMobileSize: null,
        hideFromMenu: false,
        roleTag: null,
        cockpitTileGroup: null,
        package: null,
        roles: [],
        pad: [],
        tilegroups: [],
    },
    launchpad: {
        launchpadApp: "planet9_launchpad_standard",
        extUserRoles: [],
        extUserDepartments: [],
        layout: [],
        config: { showAccessibilityFocusIndicator: true, enhancement: "" },
        enhancement: [],
        startApp: null,
        startWebApp: null,
        customLogo: null,
        hideSidemenu: false,
        ui5Version: "1.108",
        ui5Url: null,
        ui5Theme: "sap_horizon",
        header: "",
        customTheme: null,
        isExternal: null,
        emailPattern: null,
        loginApp: null,
        enableNotifications: false,
        firebaseProjectId: null,
        firebaseAppId: null,
        defaultLoginIDP: null,
        publicAccess: false,
        css: null,
        clientRequestTimeout: 120,
        limitWidth: false,
        searchBackgroundType: null,
        searchBackgroundColor: null,
        searchBackgroundShade: null,
        usedBackgroundType: null,
        usedBackgroundColor: null,
        usedBackgroundShade: null,
        searchEnableShadeCalc: null,
        usedEnableShadeCalc: null,
        enableTrace: false,
        pwa_enable: false,
        pwa_customImageIos: null,
        pwa_customImageAndroidOld: null,
        pwa_customImageAndroidNew: null,
        pwa_displayMode: null,
        pwa_themeColor: null,
        pwa_backgroundColor: null,
        passwordResetEmail: null,
        activationCodeEmail: null,
        package: null,
    },
};


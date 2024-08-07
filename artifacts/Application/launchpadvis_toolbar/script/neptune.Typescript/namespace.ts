declare namespace sap {
    export const n: any;
}

namespace visToolbar {


    export function getSearchFilter() {
        return filterArtifact.getValue();
    }


    export function shouldOnlyShowMine() {
        return toolArtifactUser.getSelectedKey() === "Mine";
    }
}

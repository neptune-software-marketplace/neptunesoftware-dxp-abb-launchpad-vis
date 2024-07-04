declare namespace sap {
    export const n: any;
}

namespace CustomComponent {
    export async function updatePackages() {
        const packages = await fetchPackagesForDialogToolbar();
        if (packages) {
            const keys = getWorkspacePackages();
            const activePackages = packages.filter(x => keys.includes(x.id))
            setPackageFilter(activePackages);
            await waitForPackageUpdate(keys);
        }
    }

    function getWorkspacePackages(): string[] {
        if (sap?.n?.storage?.getWorkspacePackages) {
            return sap?.n?.storage?.getWorkspacePackages();
        }

        const keys = localStorage.getItem("p9_workspace_packages");
        return keys ? JSON.parse(keys) : [];
    }

    export function setWorkspacePackages() {
        if (sap?.n?.storage?.setWorkspacePackages) {
            sap.n.storage.setWorkspacePackages(getSelectedPackageKeys());
        } else {
            localStorage.setItem(
                "p9_workspace_packages",
                JSON.stringify(getSelectedPackageKeys())
            );
        }
    }

    function waitForPackageUpdate(packages: string[]) {
        return new Promise<void>((resolve, reject) => {
            (function check() {
                const keys = getSelectedPackageKeys() || [];
                const updated = packages.every((x) => keys.includes(x));
                if (!updated) return setTimeout(check, 10);
                resolve();
            })();
        });
    }

    export function setPackageFilter(packages) {
        toolArtifactPackage.destroyTokens();

        packages.forEach((pkg) => {
            const { id: key, name: text } = pkg;
            toolArtifactPackage.addToken(new sap.m.Token({ key, text }));
        });
    }

    export function getSearchFilter() {
        return filterArtifact.getValue();
    }

    export function getSelectedPackageKeys() {
        return toolArtifactPackage.getTokens().map(token => token.getKey());
    }

    export function shouldOnlyShowMine() {
        return toolArtifactUser.getSelectedKey() === "Mine";
    }

    export function isPackageFilterVisible() {
        return toolArtifactPackage.getVisible();
    }

    (async function () {
        await updatePackages();
    })();
}

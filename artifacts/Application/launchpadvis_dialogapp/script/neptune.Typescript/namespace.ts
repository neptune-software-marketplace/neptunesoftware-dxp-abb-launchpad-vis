namespace CustomComponent {
    
    export let tool: string;
    export let method: string;

    export function open(toolName: string, methodName: string, selectedIds?: string[]) {
        initialize(toolName, methodName);
        dialogApp.open(fetchAppDataWrapper, selectedIds);
    }

    export function close() {
        dialogApp.close();
    }

    export function getData() {
        return dialogApp.getData();
    }

    export async function getNameForId(id: string) {
        const data = await fetchAppData(tool, method);
        return data.find((app) => app.id === id)?.name;
    }

    export async function getDataForId(id: string) {
        const data = await fetchAppData(tool, method);
        return data.find((app) => app.id === id);
    }

    export function sortRowsBy(field: string, descending = false) {
        return dialogApp.sortRowsBy(field, descending);
    }

    export async function fetchAppData(tool: string, method: string): Promise<any[]> {
        const req = await fetch(`/api/functions/${tool}/${method}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        return await req.json();
    }
    // /WEBIDE/AppList

    export function setPackageFilter(packages) {
        dialogApp.setPackageFilter(packages);
    }

    function initialize(toolName: string, methodName: string) {
        tool = toolName;
        method = methodName;
        dialogApp.setFetchDataFunc(() => fetchAppData(tool, method));
        dialogApp.update();
    }
    function fetchAppDataWrapper(): Promise<any> {
        return fetchAppData(tool, method);
    }
}

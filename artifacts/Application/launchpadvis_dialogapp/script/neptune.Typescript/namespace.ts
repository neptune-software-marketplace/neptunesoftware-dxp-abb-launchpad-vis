namespace visDialog {
    
    export let tool: string;
    export let method: string;

    export function open(toolName: string, methodName: string, selectedIds?: string[]) {
        initialize(toolName, methodName);
        visTable.open(fetchAppDataWrapper, selectedIds);
    }

    export function close() {
        visTable.close();
    }

    export function getData() {
        return visTable.getData();
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
        return visTable.sortRowsBy(field, descending);
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

    function initialize(toolName: string, methodName: string) {
        tool = toolName;
        method = methodName;
        visTable.setFetchDataFunc(() => fetchAppData(tool, method));
        visTable.update();
    }
    function fetchAppDataWrapper(): Promise<any> {
        return fetchAppData(tool, method);
    }
}

namespace CustomComponent {
    
    export function open(selectedIds: string[]) {
        dialogApp.open(fetchAppData, selectedIds);        
    }

    export function close() {
        dialogApp.close();        
    }        

    export function getData() {
        return dialogApp.getData();
    }

    export async function getNameForId(id: string) {
        const data = await fetchAppData();
        return data.find(app => app.id === id)?.name;
    }

    export async function getDataForId(id: string) {
        const data = await fetchAppData();
        return data.find(app => app.id === id);
    }

    export function sortRowsBy(field: string, descending = false) {
        return dialogApp.sortRowsBy(field, descending);
    }

    export async function fetchAppData(): Promise<any[]> {
        const req = await fetch('/api/functions/WEBIDE/AppList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return (await req.json());
    }

    export function setPackageFilter(packages) {
        dialogApp.setPackageFilter(packages);
    }

    dialogApp.setFetchDataFunc(fetchAppData);
    dialogApp.update();
}

namespace CustomComponent {
    let fetchDataFunc: (tool:string,method:string) => Promise<any>;
    let selectedIds: string[] = [];

    function getSelectedIds() {
        const data = modeltabArtifactTable.getData();
        if (Array.isArray(data)) {
            return data.filter((rec) => rec.selected).map((rec) => rec.id);
        }
        return [];
    }

    function updateSelected(data: any[]) {
        data.forEach((rec) => (selectedIds?.includes(rec.id) ? (rec.selected = true) : false));
    }

    export function open(fetchData: () => Promise<any>, selected?: string[]) {
        selectedIds = selected;
        fetchDataFunc = fetchData;
        tabArtifactTable.removeSelections(true);
        diaArtifact.open();
    }

    export function setFetchDataFunc(fetchData: () => Promise<any>) {
        fetchDataFunc = fetchData;
    }

    export function close() {
        diaArtifact.close();
    }

    export async function update(tool:string,method:string) {
        selectedIds?.push(...getSelectedIds());
        const data = await fetchDataFunc(tool,method);
        if (data) {
            updateSelected(data);
            modeltabArtifactTable.setData(data);
            await odialog_toolbar.updatePackages();
            filter();
        } else {
            odialog_header.setPageNumberUnit("0");
        }
    }

    export function getData() {
        return modeltabArtifactTable.getData();
    }

    export function setData(data: any) {
        modeltabArtifactTable.setData(data);
    }

    export function afterOpen() {
        //@ts-ignore
        odialog_toolbar_filterArtifact.focus();

        const domRef = odialog_header.getDomRef();
        //@ts-ignore
        const sub = domRef ? domRef.clientHeight : 0;
        oPageArtifactScroller.setHeight(`calc(100% - ${sub}px)`);
    }

    export function getSelectedItems() {
        return tabArtifactTable.getSelectedItems();
    }

    export function setWorkspacePackages() {
        odialog_toolbar.setWorkspacePackages();
    }

    export function sortRowsBy(field: string, descending = false) {
        //@ts-ignore
        tabArtifactTable.getBinding("items").sort([new sap.ui.model.Sorter(field, descending)]);
    }

    export function setTableMode(mode: string) {
        //@ts-ignore
        tabArtifactTable.setMode(mode);
    }

    export function getTableMode() {
        return tabArtifactTable.getMode();
    }

    export function setPackageFilter(packages) {
        odialog_toolbar.setPackageFilter(packages);
        setWorkspacePackages();
        filter();
    }

    export function filter() {
        const value = odialog_toolbar.getSearchFilter();
        const binding = tabArtifactTable.getBinding("items");
        //@ts-ignore
        const searchFilter = new sap.ui.model.Filter({
            filters: [
                //@ts-ignore
                new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, value),
                //@ts-ignore
                new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, value),
                //@ts-ignore
                new sap.ui.model.Filter("changedBy", sap.ui.model.FilterOperator.Contains, value),
            ],
            and: false,
        });

        const packageFilterVisible = odialog_toolbar.isPackageFilterVisible();

        const selectedPackages = packageFilterVisible ? odialog_toolbar.getSelectedPackageKeys() : [];
        //@ts-ignore
        const combinedFilter = new sap.ui.model.Filter({
            filters: [
                searchFilter,
                //@ts-ignore
                ...(selectedPackages.length > 0
                    ? [
                        new sap.ui.model.Filter({
                            //@ts-ignore
                            filters: [
                                ...selectedPackages.map(
                                    (key) =>
                                        new sap.ui.model.Filter(
                                            //@ts-ignore
                                            "package",
                                            sap.ui.model.FilterOperator.EQ,
                                            key
                                        )
                                ),
                            ],
                            and: false,
                        }),
                    ]
                    : []),
            ],
            and: true,
        });

        if (odialog_toolbar.shouldOnlyShowMine()) {
            let name = "";
            //@ts-ignore
            if (typeof systemSettings !== 'undefined') {
                //@ts-ignore
                name = systemSettings?.user?.username || "";
                //@ts-ignore
            } else if (typeof modelEditorData !== 'undefined') {
                //@ts-ignore
                name = modelEditorData?.oData?.User?.username || "";
            }
            // @ts-ignore
            binding.filter([
                combinedFilter,
                // @ts-ignore
                new sap.ui.model.Filter("changedBy", sap.ui.model.FilterOperator.EQ, name),
            ]);
        } else {
            // @ts-ignore
            binding.filter(combinedFilter);
        }
        // @ts-ignore
        odialog_header.setPageNumberUnit(binding.getLength());
    }

    export async function setTableEndButton() {
        //@ts-ignore
        if (tabArtifactTable.getMode() === sap.m.ListMode.MultiSelect) {
            diaArtifact.setEndButton(butSelect);
        } else {
            diaArtifact.setEndButton(butClear);
        }
    };
    setTableEndButton();
}
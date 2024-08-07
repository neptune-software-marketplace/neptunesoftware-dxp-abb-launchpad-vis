let binding = visTable.getBinding("items");
let filters = [];

filters.push(
    new sap.ui.model.Filter({
        filters: [
            new sap.ui.model.Filter("name", "Contains", this.getValue()),
            new sap.ui.model.Filter("changedBy", "Contains", this.getValue()),
            new sap.ui.model.Filter("description", "Contains", this.getValue()),
            new sap.ui.model.Filter("application", "Contains", this.getValue()),
        ],
        and: false,
    })
);

if (toolArtifactUser.getSelectedKey() === "Mine")  {
    filters.push(new sap.ui.model.Filter("changedBy", "EQ", systemSettings.user.username));
}

binding.filter(filters);

visHeader.setPageNumberUnit(binding.getLength());

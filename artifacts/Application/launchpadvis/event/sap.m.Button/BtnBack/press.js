const appData = modelData.getData();
if (appData.mode !== "view") {
    const state = graph.getNodes();

    if (state.length > 1) {
        sap.m.MessageBox.confirm("You will lose your process. Are you sure you want to go back?", {
            title: "Confirm",
            icon: "QUESTION",
            actions: ["YES", "NO"],
            onClose: function (answer) {
                if (answer === "NO") {
                    return;
                } else {
                    appData.mode = "none";
                    modelData.refresh();
                    App.to(Main);
                }
            },
        });
    } else {
        appData.mode = "none";
        modelData.refresh();
        App.to(Main);
        Functions.clear();
    }
} else {
    appData.mode = "none";
    modelData.refresh();
    App.to(Main);
    Functions.clear();
}

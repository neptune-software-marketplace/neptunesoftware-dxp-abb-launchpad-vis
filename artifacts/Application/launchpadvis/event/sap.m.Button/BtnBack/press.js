const appData = modelData.getData();
if (appData.mode !== "view") {
    sap.m.MessageBox.confirm("You will lose your process. Are you sure you want to go back?", {
        title: "Confirm",
        icon: "QUESTION",
        actions: ["YES", "NO"],
        onClose: function (answer) {
            if (answer === "NO") {
                return;
            } else {
                removeGraphEvents();
                appData.mode = "none";
                modelData.refresh();
                App.to(Main);
            }
        },
    });
} else {
    removeGraphEvents();
    appData.mode = "none";
    modelData.refresh();
    App.to(Main);
}

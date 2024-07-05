sap.m.MessageBox.confirm("Are you sure you want to clear the graph?", {
    title: "Confirm",
    icon: "QUESTION",
    actions: ["YES", "NO"],
    onClose: function (answer) {
        if (answer === "NO") {
            return;
        } else {
            clear();
            addLaunchpadNode();
            centerContent();
        }
    },
});


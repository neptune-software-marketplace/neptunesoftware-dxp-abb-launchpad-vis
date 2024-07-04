if (checkBeforeCreate()) {
    const nestedGraph = graphToJSON();
    graphToNeptune(nestedGraph)
        .then((response) => {
            console.log("Processing completed", response);
            sap.m.MessageBox.confirm("Launchpad created! Would you like to see the launchpad?", {
                title: "Confirm",
                icon: "QUESTION",
                actions: ["YES", "NO"],
                onClose: function (answer) {
                    if (answer === "NO") {
                        return;
                    } else {
                        const redirectDetails = {
                            target: {
                                semanticObject: "run",
                                action: "launchpad",
                            },
                            params: { name: response.name, id: response.id },
                        };
                        sap.n.HashNavigation.toExternal(redirectDetails);
                    }
                    clear();
                },
            });
        })
        .catch((error) => {
            console.error("Error processing graph", error);
        });
} else {
    sap.m.MessageBox.warning("There are necessary fields missing. Please fill them.");
}

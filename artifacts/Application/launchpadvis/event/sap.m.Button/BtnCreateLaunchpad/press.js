const {namesCondition, edgesCondition, shapeCondition} = checkBeforeCreate();

if (namesCondition && edgesCondition && shapeCondition) {
    const nestedGraph = graphToJSON();
    console.log(nestedGraph);
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
                    addLaunchpadNode();
                    centerContent();
                },
            });
        })
        .catch((error) => {
            console.error("Error processing graph", error);
        });
} else {
    if (!namesCondition && !edgesCondition && !shapeCondition) {
        sap.m.MessageBox.warning("Necessary fields are missing, some nodes are not connected, and required artifacts are missing.");
    } else if (!namesCondition && !edgesCondition && shapeCondition) {
        sap.m.MessageBox.warning("Necessary fields are missing and some nodes are not connected.");
    } else if (!namesCondition && edgesCondition && !shapeCondition) {
        sap.m.MessageBox.warning("Necessary fields are missing and required artifacts are missing.");
    } else if (namesCondition && !edgesCondition && !shapeCondition) {
        sap.m.MessageBox.warning("Some nodes are not connected and required artifacts are missing.");
    } else if (!namesCondition && edgesCondition && shapeCondition) {
        sap.m.MessageBox.warning("Necessary fields are missing. Please fill them.");
    } else if (namesCondition && !edgesCondition && shapeCondition) {
        sap.m.MessageBox.warning("Please complete the graph by connecting the nodes.");
    } else if (namesCondition && edgesCondition && !shapeCondition) {
        sap.m.MessageBox.warning("Required artifacts are missing. Please add the missing artifacts.");
    }
}

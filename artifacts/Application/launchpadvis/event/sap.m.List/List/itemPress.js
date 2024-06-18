const selectedItem = List.getSelectedItem();

if (selectedItem) {
    const context = selectedItem.getBindingContext("Launchpads");
    const value = context.getProperty("name");
    console.log(value);
}
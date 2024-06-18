const nestedGraph = graphToJSON();
graphToNeptune(nestedGraph).then(response => {
    console.log('Processing completed', response);
}).catch(error => {
    console.error('Error processing graph', error);
});
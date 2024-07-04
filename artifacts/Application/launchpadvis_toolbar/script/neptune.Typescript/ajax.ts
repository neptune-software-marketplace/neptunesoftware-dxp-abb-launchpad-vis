async function fetchPackagesForDialogToolbar() {
    const req = await fetch('/api/functions/Package/List', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (req.ok) {
        return await req.json();
    }    
}
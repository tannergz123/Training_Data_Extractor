export function downloadJson(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadAllAsZip(
    files: { name: string; data: unknown }[],
): void {
    // For MVP, download files individually since adding a zip library
    // would require a new dependency. Each file triggers a separate download.
    for (const file of files) {
        downloadJson(file.data, file.name);
    }
}

export const exportToCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            const rawVal = row[k];
            let cell = rawVal === null || rawVal === undefined ? '' : rawVal;
            const cellStr = cell instanceof Date ? cell.toLocaleString() : String(cell);
            let formattedCell = cellStr.replace(/"/g, '""');
            if (formattedCell.search(/("|,|\n)/g) >= 0) {
              formattedCell = `"${formattedCell}"`;
            }
            return formattedCell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

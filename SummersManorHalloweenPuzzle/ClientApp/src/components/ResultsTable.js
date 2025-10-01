import React from 'react';

// Reusable ResultsTable component with built-in row highlighting
function ResultsTable({ data, columns, groupName }) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return <div>No results available.</div>;
    }
    
    // Built-in row highlighting logic for current group
    const getRowStyle = (row) => {
        if (row.groupName === groupName) {
            return { 
                backgroundColor: '#ff6b1a !important',
                border: '2px solid #8b0000 !important',
                outline: '2px solid #ff6b1a',
                boxShadow: '0 0 8px rgba(255, 107, 26, 0.6)',
                position: 'relative',
                zIndex: 10
            }
        }
        return {};
    };
    
    return (
        <table className="table table-striped table-bordered">
            <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.dataField}>{col.text}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => {
                    const style = getRowStyle(row);
                    return (
                        <tr key={row.position ?? idx} style={style}>
                            {columns.map(col => (
                                <td key={col.dataField}>
                                    {row[col.dataField]}
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default ResultsTable;
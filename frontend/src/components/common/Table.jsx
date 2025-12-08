import React from "react";

export default function Table({ columns = [], data = [], rowKey = (row, idx) => idx }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key || column.accessor} className="px-4 py-3 font-semibold uppercase tracking-wide text-slate-500">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {data.map((row, idx) => (
                        <tr key={rowKey(row, idx)} className="hover:bg-slate-50">
                            {columns.map((column) => (
                                <td key={column.key || column.accessor} className="px-4 py-3 text-slate-700">
                                    {column.render ? column.render(row) : row[column.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

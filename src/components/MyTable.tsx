/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    FilterFn,
    useReactTable,
} from "@tanstack/react-table";

import {
    RankingInfo,
    rankItem,
} from '@tanstack/match-sorter-utils'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const rowsPerPage = [
    { id: 1, rows: 5 },
    { id: 2, rows: 10 },
    { id: 3, rows: 25 },
    { id: 4, rows: 50 },
]

declare module '@tanstack/table-core' {
    interface FilterFns {
        fuzzy: FilterFn<unknown>
    }
    interface FilterMeta {
        itemRank: RankingInfo
    }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value)

    // Store the itemRank info
    addMeta({
        itemRank,
    })

    // Return if the item should be filtered in/out
    return itemRank.passed
}

type TableProps = {
    myData: any,
    myColumns: any,
    rowsName: string
}

const MyTable = ({ myData, myColumns, rowsName }: TableProps) => {

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>('')

    const table = useReactTable({
        data: myData ?? [],
        columns: myColumns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            columnFilters,
            globalFilter,
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        globalFilterFn: fuzzyFilter,
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className='w-full rounded-lg'>

            <div className="flex items-center justify-center sm:justify-end pt-8 pb-3">
                <Input
                    placeholder="Buscar..."
                    value={globalFilter ?? ''}
                    onChange={value => setGlobalFilter(String(value.target.value))}
                    className="max-w-xs border border-gray-300"
                />
            </div>

            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-gray-700">
                <Table>
                    <TableHeader>
                        {table?.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='border-b border-slate-400'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className='text-gray-900 dark:text-gray-200 font-semibold text-sm'>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table?.getRowModel()?.rows?.length > 0 ? (

                            table?.getRowModel()?.rows
                                .map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row?.getIsSelected() && "selected"}
                                        className='text-sm hover:bg-slate-200 dark:hover:bg-slate-600 border-y border-slate-400'
                                    >
                                        {row?.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className='font-normal text-gray-800 dark:text-gray-300'>
                                                {flexRender(cell.column.columnDef.cell, cell?.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={myColumns?.length} className="h-16 text-center text-gray-700 dark:text-gray-200">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="rounded-b-lg flex items-center justify-end space-x-2 px-2 py-2 border-t border-slate-400">
                    <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {table?.getRowModel().rows.length} /{" "}
                        {table?.getFilteredRowModel().rows.length} {rowsName}
                    </div>

                    <div className='rounded-md bg-slate-50 dark:bg-gray-800'>
                        <Select onValueChange={(e: any) => {
                            table?.setPageSize(Number(e))
                        }}
                            value={table?.getState().pagination.pageSize?.toString()}>
                            <SelectTrigger className="w-[64px] h-8 dark:text-gray-300 bg-slate-300 dark:bg-slate-600 border border-transparent">
                                <SelectValue placeholder="Selecciona un número" className='text-red-500' />
                            </SelectTrigger>
                            <SelectContent className="max-h-[--radix-select-content-available-height] dark:text-gray-300 bg-slate-200 dark:bg-slate-700 border border-gray-300 dark:border-gray-600">
                                {rowsPerPage.map(pageSize => (
                                    <SelectItem
                                        key={pageSize?.id}
                                        value={pageSize?.rows?.toString()}
                                        className='focus:bg-slate-300 dark:focus:bg-slate-600 focus:text-gray-800 dark:focus:text-gray-100'
                                    >
                                        {pageSize?.rows}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 dark:text-gray-300 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 dark:hover:text-gray-100 border border-transparent"
                        onClick={() => table?.setPageIndex(0)}
                        disabled={!table?.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 dark:text-gray-300 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 dark:hover:text-gray-100 border border-transparent"
                        onClick={() => table?.previousPage()}
                        disabled={!table?.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 dark:text-gray-300 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 dark:hover:text-gray-100 border border-transparent"
                        onClick={() => table?.nextPage()}
                        disabled={!table?.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 dark:text-gray-300 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 dark:hover:text-gray-100 border border-transparent"
                        onClick={() => table?.setPageIndex(table?.getPageCount() - 1)}
                        disabled={!table?.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MyTable
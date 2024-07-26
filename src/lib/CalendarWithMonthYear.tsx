"use client"

import * as React from "react"
//import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useInput } from "react-day-picker"
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarWithMonthYear({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps & { onChange?: React.ChangeEventHandler<HTMLSelectElement> }) {

    const handleCalendarChange = (_value: string | number, _e: React.ChangeEventHandler<HTMLSelectElement>) => {
        const _event = {
            target: {
                value: String(_value)
            },
        } as React.ChangeEvent<HTMLSelectElement>
        _e(_event);

    };

    return (
        <DayPicker
            locale={es}
            weekStartsOn={0}
            showOutsideDays={showOutsideDays}
            className={cn("p-1.5", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption_start: "is-start",
                caption_between: "is-between",
                caption_end: "is-end",
                caption: "flex justify-center pt-1 relative items-center gap-1",
                caption_label: "flex h-7 text-sm font-medium justify-center items-center grow [.is-multiple_&]:flex",
                caption_dropdowns: "flex justify-center gap-1 grow dropdowns pl-8 pr-9",
                multiple_months: "is-multiple",
                vhidden: "hidden [.is-between_&]:flex [.is-end_&]:flex [.is-start.is-end_&]:hidden",
                nav: "flex items-center [&:has([name='previous-month'])]:order-first [&:has([name='next-month'])]:order-last gap-1",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 text-muted-foreground"
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-blue-800 uppercase rounded-md w-9 font-bold text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-medium aria-selected:opacity-100"
                ),
                day_range_start: "day-range-start",
                day_range_end: "day-range-end",
                day_selected:
                    "bg-blue-900 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-blue-900 focus:text-primary-foreground",
                day_today: "bg-gray-300 text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
            }}
            components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                Dropdown: ({ ...props }) => (
                    <Select
                        {...props}
                        onValueChange={(value) => {
                            if (props.onChange) {
                                handleCalendarChange(value, props.onChange)
                            }
                        }}
                        value={props.value as string}
                    >
                        <SelectTrigger className={cn(buttonVariants({ variant: "ghost" }), "uppercase h-8 w-full font-medium [.is-between_&]:hidden [.is-end_&]:hidden [.is-start.is-end_&]:flex")}>
                            <SelectValue placeholder={props?.caption} >{props?.caption}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[var(--radix-popper-available-height);] overflow-y-auto scrolling-auto min-w-[var(--radix-popper-anchor-width)]">
                            {props.children &&
                                React.Children.map(props.children, (child) =>
                                    <SelectItem value={(child as React.ReactElement<any>)?.props?.value} className="uppercase min-w-[var(--radix-popper-anchor-width)]">{(child as React.ReactElement<any>)?.props?.children}</SelectItem>
                                )
                            }
                        </SelectContent>
                    </Select>
                ),
            }}
            {...props}
        />
    )
}
CalendarWithMonthYear.displayName = "CalendarWithMonthYear"

export { CalendarWithMonthYear }
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
    defaultDate?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    dateFormat?: string;
    required?: boolean;
}

export function DatePicker({
    defaultDate,
    onChange,
    placeholder = "Pick a date",
    dateFormat = "PPP",
    required = false,
}: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(defaultDate);
    const [open, setOpen] = React.useState<boolean>(false);

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        onChange?.(selectedDate);
        setOpen(false)
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, dateFormat) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                    required={required}
                />
            </PopoverContent>
        </Popover>
    );
}

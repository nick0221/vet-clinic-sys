import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value?: Date | string | null;
    onChange?: (date: Date | undefined) => void;
    id?: string;
    name?: string;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ value, onChange, id, name, placeholder = 'Pick a date', className }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? (typeof value === 'string' ? new Date(value) : value) : undefined,
    );

    React.useEffect(() => {
        setDate(value ? (typeof value === 'string' ? new Date(value) : value) : undefined);
    }, [value]);

    return (
        <div className={className}>
            <input type="hidden" id={id} name={name} value={date ? format(date, 'yyyy-MM-dd') : ''} />
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 size-4" />
                        {date ? format(date, 'MMM d, yyyy') : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                            setDate(selectedDate);
                            onChange?.(selectedDate);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

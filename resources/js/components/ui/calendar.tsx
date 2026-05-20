import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row gap-2',
                month: 'relative flex flex-col gap-4',
                month_caption: 'flex items-center justify-center mx-9',
                caption_label: 'text-sm font-medium',
                button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    'absolute left-0 top-0 size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    'absolute right-0 top-0 size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                ),
                table: 'w-full border-collapse table-fixed',
                head_row: '',
                head_cell: 'text-muted-foreground rounded-md font-normal text-[0.8rem] text-center',
                row: '',
                cell: cn(
                    'relative p-0 text-sm text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md',
                    props.mode === 'range'
                        ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                        : '[&:has([aria-selected])]:rounded-md',
                ),
                day: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'size-8 p-0 font-normal aria-selected:opacity-100',
                ),
                day_range_start: 'day-range-start',
                day_range_end: 'day-range-end',
                day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, ...props }) =>
                    orientation === 'left' ? (
                        <ChevronLeft className="size-4" {...props} />
                    ) : (
                        <ChevronRight className="size-4" {...props} />
                    ),
            }}
            navLayout="around"
            {...props}
        />
    );
}

export { Calendar };

import * as React from 'react';

import { cn } from '@/lib/utils';

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
    const ctx = React.useContext(TabsContext);
    if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>.');
    return ctx;
}

interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn('w-full', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

interface TabsListProps extends React.ComponentProps<'div'> {}

function TabsList({ className, ...props }: TabsListProps) {
    return (
        <div
            data-slot="tabs-list"
            className={cn(
                'inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

interface TabsTriggerProps extends React.ComponentProps<'button'> {
    value: string;
}

function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
    const { value: selected, onValueChange } = useTabs();
    const isActive = selected === value;

    return (
        <button
            type="button"
            role="tab"
            data-slot="tabs-trigger"
            data-state={isActive ? 'active' : 'inactive'}
            onClick={() => onValueChange(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive && 'bg-background text-foreground shadow-sm',
                className,
            )}
            {...props}
        />
    );
}

interface TabsContentProps extends React.ComponentProps<'div'> {
    value: string;
}

function TabsContent({ className, value, ...props }: TabsContentProps) {
    const { value: selected } = useTabs();
    if (selected !== value) return null;

    return (
        <div
            data-slot="tabs-content"
            data-state="active"
            role="tabpanel"
            className={cn('mt-4', className)}
            {...props}
        />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

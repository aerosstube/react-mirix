import { cn } from '@lib/utils';
import { ControlsProps } from '@types';
import { forwardRef } from 'react';

export const Controls = forwardRef<HTMLDivElement, ControlsProps>(
	({ className, children, ...rest }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					'w-[766px] bg-card p-3 rounded-xl border backdrop-blur-3xl text-card-foreground shadow',
					className
				)}
				{...rest}
			>
				{children}
			</div>
		);
	}
);

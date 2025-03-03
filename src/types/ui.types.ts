import * as SliderPrimitive from '@radix-ui/react-slider';
import { ComponentProps } from 'react';

export interface SliderProps
	extends ComponentProps<typeof SliderPrimitive.Root> {
	progress?: number;
}

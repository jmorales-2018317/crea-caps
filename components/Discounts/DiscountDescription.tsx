"use client"

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Discount, DiscountTypeEnum } from "@/services/Discounts"
import { cn } from "@/lib/utils"

type DiscountDescriptionProps = {
	discounts: Discount[]
	title?: string
	className?: string
}

export function DiscountDescription({
	discounts,
	className,
}: DiscountDescriptionProps) {
	if (discounts.length === 0) return null

	return (
		<Accordion
			type="single"
			collapsible
			defaultValue="discounts"
			className={cn("pt-1", className)}
		>
			<AccordionItem value="discounts" className="border-0">
				<AccordionTrigger className="px-0">
					Descuentos aplicados
				</AccordionTrigger>
				<AccordionContent>
					<ul className="text-xs text-gray-500">
						{discounts.map((d, i) => {
							const amount =
								d.type === DiscountTypeEnum.PERCENTAGE
									? `${d.value}%`
									: `Q${d.value.toFixed(2)}`
							const isLast = i === discounts.length - 1
							return (
								<li key={d.id} className="flex gap-3">
									<div
										className="flex w-3 shrink-0 flex-col items-center self-stretch"
										aria-hidden
									>
										{i > 0 && <div className="h-2 w-px shrink-0 bg-border/90" />}
										<div className="relative z-10 mt-0.5 size-2.5 shrink-0 rounded-full border-2 border-muted-foreground/40 bg-background ring-2 ring-background" />
										{!isLast && (
											<div className="mt-0.5 w-px flex-1 bg-border/90 min-h-[6px]" />
										)}
									</div>
									<div
										className={cn(
											"min-w-0 flex-1 pt-0.5 leading-snug",
											!isLast && "pb-3",
										)}
									>
										<span className="text-gray-700">{d.name}</span>
										<span className="text-muted-foreground"> -{amount}</span>
									</div>
								</li>
							)
						})}
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}

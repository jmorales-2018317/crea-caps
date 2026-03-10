import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "../ui/button"
import { ButtonGroup, ButtonGroupText } from "../ui/button-group"

export type CartItemStockButtonsProps = {
	id: string
	quantity: number
	onQuantityChange: (id: string, delta: number) => void
}

export default function CartItemStockButtons({
	id,
	quantity,
	onQuantityChange,
}: CartItemStockButtonsProps) {

	return (
		<ButtonGroup
			aria-label="Media controls"
			className="h-fit shrink-0"
		>
			<Button
				type="button"
				disabled={quantity === 1}
				onClick={() => onQuantityChange(id, -1)}
				variant="outline"
				size="icon"
			>
				<MinusIcon />
			</Button>
			<ButtonGroupText className="bg-background min-w-8 justify-center">{quantity}</ButtonGroupText>
			<Button
				type="button"
				onClick={() => onQuantityChange(id, 1)}
				size="icon"
			>
				<PlusIcon />
			</Button>
		</ButtonGroup>
	)
}
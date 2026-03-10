"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { ComponentProps } from "react"

export default function GoBack({ ...props }: ComponentProps<"button">) {
	const router = useRouter()

	const handleGoBack = () => {
		router.back()
	}

	return (
		<Button
			className="absolute left-0 top-1/2 -translate-y-1/2 bg-background rounded-full"
			variant="outline"
			size="icon-lg"
			onClick={handleGoBack}
			{...props}
		>
			<ArrowLeft />
		</Button>
	)
}

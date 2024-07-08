import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export type buttonProps = {
	className?: string;
	children?: ReactNode;
};

export default function ({ className, children }: buttonProps) {
	return (
		<Button className={className} variant={"ghost"}>
			{children}
		</Button>
	);
}

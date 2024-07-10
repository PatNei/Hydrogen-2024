import { Pagination } from "@shopify/hydrogen";
import type { ReactNode } from "react";
import { ProductsGrid } from "./ProductGrid";
import { useFetcher, useLoaderData } from "@remix-run/react";
import React from "react";

export const ProductCollectionPagination = ({
	children,
}: { children: ReactNode }) => {
	return <div className="flex flex-col max-w-full gap-4 mt-2">{children}</div>;
};

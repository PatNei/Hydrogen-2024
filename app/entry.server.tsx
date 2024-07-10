import { RemixServer } from "@remix-run/react";
import { createContentSecurityPolicy } from "@shopify/hydrogen";
import type { EntryContext } from "@shopify/remix-oxygen";
import isbot from "isbot";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	const { nonce, header, NonceProvider } = createContentSecurityPolicy();

	const body = await renderToReadableStream(
		<NonceProvider>
			<RemixServer context={remixContext} url={request.url} />
		</NonceProvider>,
		{
			nonce,
			signal: request.signal,
			onError: (error) => {
				console.error(error);
				// biome-ignore lint/style/noParameterAssign: <explanation>
				responseStatusCode = 500;
			},
		},
	);

	if (isbot(request.headers.get("user-agent"))) {
		await body.allReady;
	}

	responseHeaders.set("Content-Type", "text/html");
	responseHeaders.set("Content-Security-Policy", header);

	return new Response(body, {
		headers: responseHeaders,
		status: responseStatusCode,
	});
}

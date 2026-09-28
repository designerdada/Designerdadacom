/** Renders a JSON-LD script tag. `<` is escaped so content can never close the script element. */
export function JsonLd({ data }: { data: object }) {
	return (
		<script
			type='application/ld+json'
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
		/>
	);
}

import { projects } from "../data/projects";

function getFaviconUrl(url: string) {
	try {
		const domain = new URL(url).hostname;
		return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
	} catch {
		return "";
	}
}

function getDomain(url: string) {
	try {
		return new URL(url).hostname.replace("www.", "");
	} catch {
		return url;
	}
}

export function ProjectsSection() {
	return (
		<div className='flex flex-col gap-3 items-start relative shrink-0 w-full'>
			<div className='flex flex-col gap-3 items-start relative shrink-0 w-full'>
				{projects.map((project) => (
					<a
						key={project.id}
						href={project.url}
						target='_blank'
						rel='noopener noreferrer'
						className='flex gap-4 items-center relative shrink-0 w-full hover:opacity-70 transition-opacity group'>
						<div className='basis-0 flex gap-4 grow items-center min-h-px min-w-px relative shrink-0'>
							<div className='relative shrink-0 size-5'>
								<img
									alt={`${project.name} favicon`}
									className='absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full'
									src={getFaviconUrl(project.url)}
								/>
							</div>
							<div className='basis-0 flex gap-2 grow items-center min-h-px min-w-px relative shrink-0'>
								<p className='font-semibold relative shrink-0 text-olive-800 dark:text-olive-100 text-sm text-justify text-nowrap whitespace-pre group-hover:underline underline-offset-4'>
									{project.name}
								</p>
								<p className='relative shrink-0 text-xs text-justify text-nowrap text-olive-500 whitespace-pre'>
									/
								</p>
								<p className='[white-space-collapse:collapse] basis-0 grow min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-olive-500 dark:text-olive-100 text-sm text-justify text-nowrap'>
									{project.description}
								</p>
							</div>
						</div>
						<p
							className={`relative shrink-0 text-sm font-medium text-nowrap whitespace-pre font-mono uppercase ${
								project.status === "Active"
									? "text-green-600 dark:text-green-500"
									: "text-olive-400"
							}`}>
							{project.status}
						</p>
					</a>
				))}
			</div>
		</div>
	);
}

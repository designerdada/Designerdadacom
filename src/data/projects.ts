export interface Project {
	id: string;
	name: string;
	description: string;
	url: string;
}

export const projects: Project[] = [
	{
		id: "peerlist",
		name: "Peerlist",
		description: "Professional network for builders",
		url: "https://peerlist.io",
	},
	{
		id: "autosend",
		name: "AutoSend",
		description: "Email for developers, marketers, and AI agents",
		url: "https://autosend.com",
	},
];

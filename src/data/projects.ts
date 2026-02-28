export interface Project {
	id: string;
	name: string;
	description: string;
	url: string;
	status: "Active" | "Archive";
}

export const projects: Project[] = [
	{
		id: "peerlist",
		name: "Peerlist",
		description: "Professional network for builders",
		url: "https://peerlist.io",
		status: "Active",
	},
	{
		id: "autosend",
		name: "AutoSend",
		description: "Email for developers, marketers, and AI agents",
		url: "https://autosend.com",
		status: "Active",
	},
	{
		id: "foxchat",
		name: "Foxchat",
		description: "Lightweight Intercom alternative",
		url: "https://www.foxchat.dev",
		status: "Active",
	},
];

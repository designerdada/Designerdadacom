export interface Project {
	id: string;
	name: string;
	description: string;
	url: string;
}

export const projects: Project[] = [
	{
		id: "autosend",
		name: "AutoSend",
		description: "Email infra for teams building with AI agents",
		url: "https://autosend.com",
	},
	{
		id: "peerlist",
		name: "Peerlist",
		description: "Professional network for builders",
		url: "https://peerlist.io",
	},
	{
		id: "foxchat",
		name: "Foxchat",
		description: "Intercom-style live chat widget for websites",
		url: "https://foxchat.dev",
	},
];

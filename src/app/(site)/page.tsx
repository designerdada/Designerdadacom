import Link from "next/link";
import type { Metadata } from "next";
import { Divider } from "@/components/Divider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SayHello } from "@/components/SayHello";
import { WritingSection } from "@/components/WritingSection";
import { rssAlternate } from "@/lib/metadata";

export const metadata: Metadata = {
	alternates: { canonical: "/", types: rssAlternate },
};

export default function Home() {
	return (
		<div className='bg-olive-100 dark:bg-olive-900 min-h-screen w-full flex justify-center py-10'>
			<div className='flex flex-col gap-6 items-center w-full max-w-xl px-4 m-0'>
				{/* Header */}
				<div className='animate-in w-full'>
					<Header activePage='home' />
				</div>

				{/* Bio Content */}
				<div className='font-normal min-w-full relative shrink-0 text-olive-800 dark:text-olive-100 text-sm/6 text-justify flex flex-col gap-4'>
					<p className='relative animate-in animate-delay-1'>
						<span>I'm a product designer and founder building </span>
						<a
							href='https://peerlist.io'
							target='_blank'
							rel='noopener noreferrer'
							className='link'>
							Peerlist
						</a>
						<span> and </span>
						<a
							href='https://autosend.com'
							target='_blank'
							rel='noopener noreferrer'
							className='link'>
							AutoSend
						</a>
						<span>
							. Over the past 15 years, I've focused on designing beautiful software that people
							love to use.
						</span>
					</p>
					<p className='animate-in animate-delay-2'>
						<span>I regularly </span>
						<Link href='/writing' className='link font-normal'>
							write
						</Link>
						<span>
							{" "}
							about my design philosophy, approach to building products, and hard-won lessons from
							my journey as a founder. These essays are my way of thinking through challenges and
							sharing what I've learned along the way.
						</span>
					</p>
					<p className='animate-in animate-delay-3'>
						<span>When I'm not designing, I love shooting street </span>
						<a
							href='https://retrolens.me'
							target='_blank'
							rel='noopener noreferrer'
							className='link'>
							photography
						</a>
						<span>
							{" "}
							on film with my Leica M6. There's something special about slowing down and capturing
							everyday moments on analog.
						</span>
					</p>
					<p className='animate-in animate-delay-4'>
						<span>
							Always open to interesting conversations about design, startups, and photography.{" "}
						</span>
						<SayHello />
						<span> or follow me on </span>
						<a
							href='https://peerlist.io/designerdada'
							target='_blank'
							rel='noopener noreferrer'
							className='link'>
							Peerlist
						</a>
						<span>, </span>
						<a
							href='https://x.com/designerdada'
							target='_blank'
							rel='noopener noreferrer'
							className='link'>
							X
						</a>
						<span>, or </span>
						<a
							href='https://instagram.com/retrolens.me'
							target='_blank'
							rel='noopener noreferrer'
							className='link'>
							Instagram
						</a>
						<span>.</span>
					</p>
				</div>

				{/* Divider */}
				<div className='animate-in animate-delay-5'>
					<Divider />
				</div>

				{/* Projects Section */}
				<div className='animate-in animate-delay-6 w-full'>
					<ProjectsSection />
				</div>

				{/* Divider */}
				<div className='animate-in animate-delay-7'>
					<Divider />
				</div>

				{/* Writing Section */}
				<div className='animate-in animate-delay-8 w-full'>
					<WritingSection />
				</div>

				{/* Divider */}
				<div className='animate-in animate-delay-9'>
					<Divider />
				</div>

				{/* Footer */}
				<div className='animate-in animate-delay-10 w-full'>
					<Footer />
				</div>
			</div>
		</div>
	);
}

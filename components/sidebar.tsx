import React from 'react';
import type { NextPage } from "next";
import { loginState, workspacestate } from "@/state";
import { useRecoilState } from "recoil";
import { Menu, Listbox, Transition, Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import { IconHome, IconWall, IconClipboardList, IconSpeakerphone, IconUsers, IconSettings, IconChevronDown, IconFileText, IconLogout, IconCheck, IconUser, IconBuildingCommunity, IconChevronLeft, IconMenu2, IconX } from "@tabler/icons";
import axios from "axios";
import { useState } from "react";
import clsx from 'clsx';

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (value: boolean) => void;
}

const Sidebar: NextPage<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showCopyright, setShowCopyright] = useState(false);
	const router = useRouter();

	const pages = [
		{ name: "Home", href: "/workspace/[id]", icon: IconHome },
		{ name: "Wall", href: "/workspace/[id]/wall", icon: IconWall },
		{ name: "Activity", href: "/workspace/[id]/activity", icon: IconClipboardList, accessible: workspace.yourPermission.includes('view_entire_groups_activity') },
		{ name: "Allies", href: "/workspace/[id]/allies", icon: IconBuildingCommunity },
		{ name: "Sessions", href: "/workspace/[id]/sessions", icon: IconSpeakerphone, accessible: workspace.yourPermission.includes('manage_sessions') },
		{ name: "Staff", href: "/workspace/[id]/views", icon: IconUsers, accessible: workspace.yourPermission.includes('view_members') },
		{ name: "Docs", href: "/workspace/[id]/docs", icon: IconFileText, accessible: workspace.yourPermission.includes('manage_docs') },
		{ name: "Settings", href: "/workspace/[id]/settings", icon: IconSettings, accessible: workspace.yourPermission.includes('admin') }
	];

	const gotopage = (page: string) => {
		router.push(page.replace("[id]", workspace.groupId.toString()));
		setIsMobileMenuOpen(false);
	};

	const logout = async () => {
		await axios.post("/api/auth/logout");
		setLogin({
			userId: 1,
			username: '',
			displayname: '',
			canMakeWorkspace: false,
			thumbnail: '',
			workspaces: [],
			isOwner: false
		});
		router.push('/login');
	};

	return (
		<>
			<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow">
				<IconMenu2 className="w-6 h-6 text-gray-700 dark:text-gray-200 flex-shrink-0" />
			</button>

			{isMobileMenuOpen && (
				<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
			)}

			<aside className={clsx(
				"fixed lg:sticky top-0 h-screen bg-white dark:bg-gray-800 shadow-lg transition-all duration-300",
				isCollapsed ? "w-[4.5rem]" : "w-64",
				isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
			)}>
				<div className="h-full flex flex-col p-3">
					<button onClick={() => setIsCollapsed(!isCollapsed)} className="grid place-content-center p-2 mb-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
						<IconChevronLeft className={clsx("w-5 h-5 text-gray-500 transition-transform flex-shrink-0", isCollapsed && "rotate-180")} />
					</button>

					<div className="relative">
						<Listbox value={workspace.groupId}>
							<Listbox.Button className={clsx(
								"w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
								isCollapsed && "justify-center"
							)}>
								<div className="w-10 h-10 flex-shrink-0">
									<img src={workspace.groupThumbnail || "/favicon-32x32.png"} alt="" className="w-full h-full rounded-lg object-cover" />
								</div>
								{!isCollapsed && (
									<>
										<div className="flex-1 text-left">
											<p className="text-sm font-medium truncate">{workspace.groupName}</p>
											<p className="text-xs text-gray-500">Switch workspace</p>
										</div>
										<IconChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
									</>
								)}
							</Listbox.Button>
							<div className={clsx(
								"absolute top-0 z-50 w-64 mt-14",
								isCollapsed ? "left-full ml-2" : "left-0"
							)}>
								<Listbox.Options className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 max-h-64 overflow-auto">
									{login?.workspaces?.map((ws) => (
										<Listbox.Option key={ws.groupId} value={ws.groupId} className={({ active }) => clsx(
											"flex items-center gap-3 px-3 py-2 cursor-pointer",
											active && "bg-primary/10"
										)}>
											<img src={ws.groupThumbnail} alt="" className="w-8 h-8 rounded-lg object-cover" />
											<span className="flex-1 truncate text-sm">{ws.groupName}</span>
											{workspace.groupId === ws.groupId && (
												<IconCheck className="w-5 h-5 text-primary" />
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</div>
						</Listbox>
					</div>

					<nav className="flex-1 space-y-1 mt-4">
						{pages.map((page) => (
							(page.accessible === undefined || page.accessible) && (
								<button
									key={page.name}
									onClick={() => gotopage(page.href)}
									className={clsx(
										"w-full gap-3 px-2 py-2 rounded-lg text-sm font-medium",
										router.pathname === page.href
											? "bg-primary/10 text-primary"
											: "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
										isCollapsed
											? "grid place-content-center"
											: "justify-start flex gap-2 items-center"
									)}
								>
									<div className="w-5 h-5 grid place-content-center flex-shrink-0">
										<page.icon className="w-5 h-5" />
									</div>
									{!isCollapsed && <span>{page.name}</span>}
								</button>
							)
						))}
					</nav>

					<div className="relative mt-4">
						<Menu>
							<Menu.Button className={clsx(
								"w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
								isCollapsed && "justify-center"
							)}>
								<div className="w-10 h-10 flex-shrink-0">
									<img src={login?.thumbnail} alt="" className="w-full h-full rounded-lg object-cover" />
								</div>
								{!isCollapsed && (
									<>
										<div className="flex-1 text-left">
											<p className="text-sm font-medium truncate">{login?.displayname}</p>
											<p className="text-xs text-gray-500">View profile</p>
										</div>
										<IconChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
									</>
								)}
							</Menu.Button>
							<div className={clsx(
								"absolute bottom-full z-50 w-64 mb-2",
								isCollapsed ? "left-full ml-2" : "left-0"
							)}>
								<Menu.Items className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={() => router.push(`/workspace/${workspace.groupId}/profile/${login.userId}`)}
												className={clsx(
													"w-full flex items-center gap-2 px-3 py-2",
													active && "bg-primary/10"
												)}
											>
												<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
													<IconUser className="w-5 h-5" />
												</div>
												<span>Profile</span>
											</button>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={logout}
												className={clsx(
													"w-full flex items-center gap-2 px-3 py-2",
													active && "bg-primary/10"
												)}
											>
												<div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
													<IconLogout className="w-5 h-5" />
												</div>
												<span>Logout</span>
											</button>
										)}
									</Menu.Item>
								</Menu.Items>
							</div>
						</Menu>
					</div>

					{!isCollapsed && (
						<>
							<button 
								onClick={() => setShowCopyright(true)} 
								className="mt-4 text-left text-xs text-gray-500 hover:text-primary"
							>
								© Copyright Notices
							</button>

							<Dialog
								open={showCopyright}
								onClose={() => setShowCopyright(false)}
								className="relative z-50"
							>
								<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

								<div className="fixed inset-0 flex items-center justify-center p-4">
									<Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
										<div className="flex items-center justify-between mb-4">
											<Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
												Copyright Notices
											</Dialog.Title>
											<button
												onClick={() => setShowCopyright(false)}
												className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
											>
												<IconX className="w-5 h-5 text-gray-500" />
											</button>
										</div>

										<div className="space-y-4">
											<div>
												<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
													Orbit features, enhancements, and modifications:
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													Copyright © 2025 Planetary. All rights reserved.
												</p>
											</div>

											<div>
												<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
													Original Tovy features and code:
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													Copyright © 2022 Tovy. All rights reserved.
												</p>
											</div>
										</div>
									</Dialog.Panel>
								</div>
							</Dialog>
						</>
					)}
				</div>
			</aside>
		</>
	);
};

export default Sidebar;

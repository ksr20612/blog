<script lang="ts">
	import { resolve } from "$app/paths";
	import RiMenuLine from "remixicon-svelte/icons/menu-line";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { site } from "$lib/site";
	import ThemeToggle from "./theme-toggle.svelte";

	let menuOpen = $state(false);

	const links = [
		{ href: resolve("/"), label: "Home" },
		{ href: resolve("/posts"), label: "Posts" },
	];

	function closeMenu() {
		menuOpen = false;
	}
</script>

<header class="border-b bg-background/80 sticky top-0 z-40 backdrop-blur">
	<div class="mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 px-4">
		<a href={resolve("/")} class="font-medium tracking-tight">
			{site.title}
		</a>

		<nav class="hidden items-center gap-1 md:flex">
			{#each links as link (link.href)}
				<Button variant="ghost" href={link.href}>{link.label}</Button>
			{/each}
			<ThemeToggle />
		</nav>

		<div class="flex items-center gap-1 md:hidden">
			<ThemeToggle />
			<Sheet.Root bind:open={menuOpen}>
				<Sheet.Trigger
					class={buttonVariants({ variant: "outline", size: "icon" })}
					aria-label="메뉴 열기"
				>
					<RiMenuLine />
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-72">
					<Sheet.Header>
						<Sheet.Title>{site.title}</Sheet.Title>
						<Sheet.Description>페이지로 이동</Sheet.Description>
					</Sheet.Header>
					<nav class="flex flex-col gap-1 px-4">
						{#each links as link (link.href)}
							<Button variant="ghost" class="justify-start" href={link.href} onclick={closeMenu}>
								{link.label}
							</Button>
						{/each}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>

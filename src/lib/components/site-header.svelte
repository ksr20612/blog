<script lang="ts">
	import { resolve } from "$app/paths";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { site } from "$lib/site";
	import { cn } from "$lib/utils.js";
	import RiAccountCircleLine from "remixicon-svelte/icons/account-circle-line";
	import RiGithubFill from "remixicon-svelte/icons/github-fill";
	import RiMenuLine from "remixicon-svelte/icons/menu-line";
	import ThemeToggle from "./theme-toggle.svelte";

	let menuOpen = $state(false);

	const links = [
		{ href: resolve("/"), label: "Home" },
		{ href: resolve("/posts"), label: "Posts" },
	];

	function closeMenu() {
		menuOpen = false;
	}

	const iconButtonClass =
		"bg-card ring-1 ring-[#efeeeb] hover:bg-card hover:ring-foreground/20 dark:ring-foreground/10 dark:hover:bg-card";
</script>

{#snippet profileLink()}
	<Button
		href={site.profile}
		target="_blank"
		rel="noreferrer"
		variant="outline"
		size="icon"
		class={iconButtonClass}
		aria-label="프로필, 새 탭에서 열림"
	>
		<RiAccountCircleLine />
	</Button>
{/snippet}

{#snippet githubLink()}
	<Button
		href={site.github}
		target="_blank"
		rel="noreferrer"
		variant="outline"
		size="icon"
		class={iconButtonClass}
		aria-label="GitHub, 새 탭에서 열림"
	>
		<RiGithubFill />
	</Button>
{/snippet}

<header class="border-b bg-background/80 sticky top-0 z-40 backdrop-blur">
	<div class="mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 px-4">
		<a href={resolve("/")} class="font-medium tracking-tight">
			{site.title}
		</a>

		<div class="hidden items-center gap-1 md:flex">
			<nav class="flex items-center gap-1">
				{#each links as link (link.href)}
					<Button variant="ghost" href={link.href}>{link.label}</Button>
				{/each}
			</nav>
			{@render profileLink()}
			{@render githubLink()}
			<ThemeToggle class={iconButtonClass} />
		</div>

		<div class="flex items-center gap-1 md:hidden">
			{@render profileLink()}
			{@render githubLink()}
			<ThemeToggle class={iconButtonClass} />
			<Sheet.Root bind:open={menuOpen}>
				<Sheet.Trigger
					class={cn(buttonVariants({ variant: "outline", size: "icon" }), iconButtonClass)}
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

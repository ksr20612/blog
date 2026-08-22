---
title: Markdown만 올리면 글이 되는 블로그
description: content/posts에 md 파일을 추가하면 목록과 상세 페이지가 자동으로 만들어집니다.
date: 2026-08-22
tags: [svelte, typescript]
draft: false
---

Velog에서 옮겨오면서 가장 중요하게 본 건 **글을 쓰는 방식**이었습니다. 이 블로그는 `content/posts`에 Markdown 파일만 넣으면 됩니다.

## Frontmatter

파일 맨 위에 YAML을 둡니다.

```md
---
title: 글 제목
description: 목록과 SEO에 쓰이는 한 줄
date: 2026-08-22
tags: [svelte, typescript]
draft: false
---
```

`draft: true`인 글은 빌드에서 빠집니다.

## 코드 하이라이트

TypeScript도 그대로 렌더링됩니다.

```ts
export function greet(name: string) {
	return `안녕하세요, ${name}`;
}
```

글을 옮길 때는 Velog에서 보낸 Markdown을 위 형식에 맞춰 저장하면 됩니다.

const port = Number(Bun.env.PORT ?? 5173);
const root = new URL("../", import.meta.url);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/src/ui/index.html" : url.pathname;
    const fileUrl = new URL(`.${pathname}`, root);

    if (!fileUrl.pathname.startsWith(root.pathname)) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = Bun.file(fileUrl);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }

    const extension = fileUrl.pathname.slice(fileUrl.pathname.lastIndexOf("."));
    return new Response(file, {
      headers: { "content-type": contentTypes[extension] ?? "application/octet-stream" }
    });
  }
});

console.log(`Econosphere MVT listening on http://localhost:${port}`);

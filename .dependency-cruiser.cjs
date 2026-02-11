/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: "no-circular",
			comment:
				"Dependencias circulares tornam o grafo difícil de manter e evoluir.",
			severity: "error",
			from: {},
			to: { circular: true },
		},
		{
			name: "no-import-from-app",
			comment:
				"App e a camada de composicao; outras camadas nao devem depender dela.",
			severity: "error",
			from: { path: "^src/(core|shared|modules)/" },
			to: { path: "(^|/)src/app/" },
		},
		{
			name: "core-no-internal-deps",
			comment:
				"Core nao deve depender de outras camadas internas (shared, modules, app).",
			severity: "error",
			from: { path: "^src/core/" },
			to: { path: "(^|/)src/(shared|modules|app)/" },
		},
		{
			name: "shared-no-app-or-modules",
			comment: "Shared pode depender de core, mas nao de app ou modules.",
			severity: "error",
			from: { path: "^src/shared/" },
			to: { path: "(^|/)src/(app|modules)/" },
		},
	],
	options: {
		doNotFollow: {
			path: "node_modules",
			dependencyTypes: [
				"npm",
				"npm-dev",
				"npm-optional",
				"npm-peer",
				"npm-bundled",
				"npm-no-pkg",
			],
		},
		tsConfig: {
			fileName: "tsconfig.app.json",
		},
		enhancedResolveOptions: {
			extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
		},
		reporterOptions: {
			dot: {
				collapsePattern: "node_modules/(?:@[^/]+/[^/]+|[^/]+)",
			},
		},
	},
};

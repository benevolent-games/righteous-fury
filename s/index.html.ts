
import "@benev/slate/x/node.js"
import {renderSocialCard} from "./dom/static/social-card.js"
import {template, html, easypage, headScripts, git_commit_hash, read_file} from "@benev/turtle"

const domain = "rogue.benev.gg"
const favicon = "/assets/images/items/ivLoKJGtTXd.webp"

export default template(async basic => {
	const path = basic.path(import.meta.url)
	const hash = await git_commit_hash()

	return easypage({
		path,
		dark: true,
		css: "index.css",
		title: "ROGUE CRUSADE",
		head: html`
			<link rel="icon" href="${favicon}"/>
			<link rel="stylesheet" href="${path.version.root("index.css")}"/>
			<meta data-commit-hash="${hash}"/>

			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Metamorphous&display=swap" rel="stylesheet">

			${renderSocialCard({
				themeColor: "#ff2200",
				siteName: domain,
				title: "⚔️ ROGUE CRUSADE",
				description: "The Ultimate Roguelike",
				image: `https://${domain}${favicon}`,
				url: `https://${domain}/`,
				type: "website",
			})}

			${headScripts({
				devModulePath: await path.version.root("index.bundle.js"),
				prodModulePath: await path.version.root("index.bundle.min.js"),
				importmapContent: await read_file("x/importmap.json"),
			})}
		`,
		body: html`
			<game-app></game-app>
		`,
	})
})


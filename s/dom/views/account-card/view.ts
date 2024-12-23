
import {Bytename, deep, Hex, html, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import {context} from "../../context.js"
import {AvatarView} from "../avatar/view.js"
import themeCss from "../../../dom/theme.css.js"
import {IdView} from "../../../dom/views/id/view.js"
import {Avatar} from "../../../features/accounts/avatars.js"
import {Identity} from "../../../archimedes/net/multiplayer/types.js"
import {AccountPayload, isAvatarAllowed} from "../../../features/accounts/sketch.js"

type Info = {
	loggedIn: boolean
	id: string
	name: string
	avatar: Avatar
	tags: string[]
}

async function ascertainPersonInfo(identity: Identity): Promise<Info> {
	if (identity.kind === "rando") {
		const avatarPref = Avatar.get(identity.avatarId)
		const avatar = isAvatarAllowed(avatarPref, undefined)
			? avatarPref
			: Avatar.default
		return {
			loggedIn: false,
			avatar,
			id: identity.id,
			name: Bytename.string(Hex.bytes(identity.id).slice(0, 5)),
			tags: ["rando"],
		}
	}
	else {
		const pubkey = await context.accountingPubkey
		const {data: account} = await pubkey.verify<AccountPayload>(identity.accountToken)
		return {
			loggedIn: true,
			id: account.thumbprint,
			name: account.name,
			avatar: Avatar.get(account.avatarId),
			tags: account.tags,
		}
	}
}

export const AccountCardView = shadowView(use => (
		identity_: Identity,
		isLoading: boolean,
	) => {

	use.name("account-card")
	use.styles(themeCss, stylesCss)

	const identity = use.signal(identity_)
	if (!deep.equal(identity.value, identity_))
		identity.value = identity_

	const infoOp = use.op<Info>()
	const info = infoOp.payload

	use.mount(() => {
		const reload = () => infoOp.load(
			async() => ascertainPersonInfo(identity.value)
		)
		reload()
		return identity.on(reload)
	})

	return html`
		${AvatarView([
			info?.avatar ?? Avatar.default,
			{loading: info ? isLoading : true},
		])}

		<div x-info>
			<span x-name>${info?.name ?? "~"}</span>

			<ul x-features>
				<li x-thumbprint>${info ? IdView([info.id]) : "~"}</li>
				${info && info.tags.map(tag => html`
					<li x-tag>${tag}</li>
				`)}
			</ul>
		</div>
	`
})


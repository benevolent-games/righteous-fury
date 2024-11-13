
import {html, shadowView} from "@benev/slate"

import stylesCss from "./styles.css.js"
import themeCss from "../../theme.css.js"
import {Gigamenu} from "../gigamenu/view.js"
import {constants} from "../../../constants.js"
import {AccountPanel} from "../gigamenu/panels/account/panel.js"

export const MainMenu = shadowView(use => ({nav}: {
		nav: {
			host: () => void
			loopback: () => void
		}
	}) => {

	use.styles(themeCss, stylesCss)

	return html`
		<div class=overlay>
			${Gigamenu([AccountPanel()])}
		</div>

		<section class=plate style="background-image: url('${constants.urls.cover}');">
			<h1>Righteous Fury</h1>
			<nav>
				<button class="naked flashy" @click="${nav.host}">
					Host
				</button>
				<button class="naked flashy" @click="${nav.loopback}">
					Loopback
				</button>
			</nav>
		</section>
	`
})


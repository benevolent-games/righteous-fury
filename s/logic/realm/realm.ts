
import "@benev/toolbox/x/babylon-side-effects.js"

import {pubsub} from "@benev/slate"
import {Mesh} from "@babylonjs/core"

import {Glbs} from "./glbs.js"
import {Physics} from "../physics/physics.js"
import {makeTact} from "./utils/make-tact.js"
import {World} from "../../tools/babylon/world.js"
import {replica} from "../framework/replication/types.js"
import {makeEnvironment} from "./utils/make-environment.js"

export class Realm {
	static replica = replica<Realm>()
	tact = makeTact(window)
	env: ReturnType<typeof makeEnvironment>
	onFilesDropped = pubsub<[File[]]>()
	physics = new Physics()

	constructor(public world: World, public glbs: Glbs) {
		this.env = makeEnvironment(world)
	}

	instance(source: Mesh) {
		return source.createInstance("instance")
	}
}


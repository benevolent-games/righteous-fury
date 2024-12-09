
import {deep, Map2} from "@benev/slate"
import {GameState} from "../parts/game-state.js"
import {Lifecycles} from "../parts/lifecycles.js"
import {ReplicaPack, ReplicaReturn, Replicas} from "./types.js"
import {Entities, InputShell} from "../parts/types.js"

export class Replicator<xEntities extends Entities, xRealm> {
	lifecycles: Lifecycles<ReplicaReturn<any>>

	constructor(
			public author: number,
			public realm: xRealm,
			public gameState: GameState<xEntities>,
			public replicas: Replicas<xEntities, xRealm>,
		) {

		this.lifecycles = new Lifecycles<ReplicaReturn<any>>(
			new Map2(Object.entries(replicas).map(([kind, replica]) => {
				const fn = (id: number, state: any) => replica(
					{realm, id, state, replicator: this} as ReplicaPack<xEntities, any, xRealm>
				)
				return [kind, fn]
			}))
		)
	}

	gatherInputs(tick: number): InputShell<any>[] {
		return [...this.lifecycles.entities]
			.map(([id, entity]) => {
				const input = entity.gatherInputs(tick)
				return input && deep.clone({
					entity: id,
					author: this.author,
					data: input.data,
					messages: input.messages ?? [],
				})
			})
			.filter(input => !!input)
	}

	replicate(tick: number) {
		this.lifecycles.conform(this.gameState)
		for (const [id, entity] of [...this.lifecycles.entities]) {
			const [,state] = this.gameState.entities.require(id)
			entity.replicate(tick, state)
		}
	}
}


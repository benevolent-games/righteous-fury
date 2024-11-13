
import {interval} from "@benev/slate"

import {Fiber} from "../tools/fiber.js"
import {fakeLag} from "../tools/fake-lag.js"
import {Realm} from "../logic/realm/realm.js"
import {World} from "../tools/babylon/world.js"
import {Station} from "../logic/station/station.js"
import {simulas} from "../logic/archetypes/simulas.js"
import {replicas} from "../logic/archetypes/replicas.js"
import {Liaison} from "../logic/framework/relay/liaison.js"
import {Message} from "../logic/framework/relay/messages.js"
import {Parcel} from "../logic/framework/relay/inbox-outbox.js"
import {Clientele} from "../logic/framework/relay/clientele.js"
import {Coordinates} from "../logic/realm/utils/coordinates.js"
import {Simulator} from "../logic/framework/simulation/simulator.js"
import {lagProfiles} from "../logic/framework/utils/lag-profiles.js"
import {Replicator} from "../logic/framework/replication/replicator.js"
import {MultiplayerClient} from "../logic/multiplayer/multiplayer-client.js"

export async function joinFlow(multiplayer: MultiplayerClient) {
	const lag = fakeLag(lagProfiles.bad)

	// host stuff
	const station = new Station()
	const simulator = new Simulator(station, simulas)
	const clientele = new Clientele()
	const {replicatorId, liaison: hostsideLiaison} = clientele.makeLiaison(new Fiber<Parcel<Message>>())

	// client stuff
	const world = await World.load()
	const realm = new Realm(world)
	const replicator = new Replicator(realm, replicas, replicatorId)
	const clientsideLiaison = new Liaison(new Fiber<Parcel<Message>>())

	// cross-wire the host and the client
	const alice = hostsideLiaison.fiber
	const bob = clientsideLiaison.fiber
	alice.reliable.send.on(m => lag(() => bob.reliable.recv(m)))
	alice.unreliable.send.on(m => lag(() => bob.unreliable.recv(m)))
	bob.reliable.send.on(m => lag(() => alice.reliable.recv(m)))
	bob.unreliable.send.on(m => lag(() => alice.unreliable.recv(m)))

	// initial game state
	simulator.create("player", {
		owner: replicator.id,
		coordinates: Coordinates.zero(),
	})

	// ticker
	const stopTicking = interval.hz(60, () => {

		// host side activity
		{
			const feedbacks = clientele.collectAllFeedbacks()
			simulator.simulate(feedbacks)
			const feed = simulator.collector.take()
			hostsideLiaison.sendFeed(feed)
		}

		// client side activity
		{
			const {feed} = clientsideLiaison.take()
			replicator.replicate(feed)
			const feedback = replicator.collector.take()
			clientsideLiaison.sendFeedback(feedback)
		}
	})

	// init 3d rendering
	world.rendering.setCamera(realm.env.camera)
	world.gameloop.start()

	return {
		realm,
		multiplayer,
		dispose: () => {
			stopTicking()
			world.dispose()
		},
	}
}


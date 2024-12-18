
import {Map2} from "@benev/slate"
import {Degrees, Randy, Vec2} from "@benev/toolbox"
import {AssetContainer} from "@babylonjs/core/assetContainer.js"

import {DungeonAssets} from "./assets.js"
import {Realm} from "../../realm/realm.js"
import {DungeonLayout} from "../layout.js"
import {planWalls} from "./walls/plan-walls.js"
import {DungeonPlacer} from "../rendering/placer.js"
import {Culler} from "../rendering/culling/culler.js"
import {WallFader} from "../rendering/walls/wall-fader.js"
import {WallSubject} from "../rendering/walls/wall-subject.js"
import {SubjectGrid} from "../rendering/culling/subject-grid.js"
import {GlobalTileVec2, LocalCellVec2} from "../layouting/space.js"
import {CullingSubject} from "../rendering/culling/culling-subject.js"

export class DungeonSkin {
	randy: Randy
	placer: DungeonPlacer

	assets: DungeonAssets
	styleKeyByCell = new Map2<LocalCellVec2, string>()

	cullableGrid = new SubjectGrid()
	fadingGrid = new SubjectGrid<WallSubject>()

	culler = new Culler(this.cullableGrid)
	wallFader = new WallFader(this.fadingGrid)

	constructor(
			public layout: DungeonLayout,
			public container: AssetContainer,
			public realm: Realm,
			public mainScale: number,
		) {

		this.randy = new Randy(layout.options.seed)
		this.assets = new DungeonAssets(container, this.randy)
		this.placer = new DungeonPlacer(mainScale)

		const styles = [...this.assets.styles.keys()]

		for (const cell of this.layout.cells)
			this.styleKeyByCell.set(cell, this.randy.choose(styles))

		this.#createFlooring()
		this.#createWalls()
	}

	#getStyle = (tile: GlobalTileVec2) => {
		const {cell} = this.layout.lookupTile(tile)
		const key = this.styleKeyByCell.require(cell)
		return this.assets.styles.require(key)
	}

	#createFlooring() {
		for (const tile of this.layout.floorTiles.values()) {
			const style = this.#getStyle(tile)

			const radians = Degrees.toRadians(this.randy.choose([0, -90, -180, -270]))
			const cargo = style.floors.require("1x1")()
			const spatial = this.placer.placeProp({location: tile, radians})
			const spawn = () => cargo.instance(spatial)

			const subject = new CullingSubject(tile, spawn)
			this.cullableGrid.add(subject)
		}
	}

	#createWalls() {
		const plan = planWalls(
			this.randy,
			this.layout.wallTiles,
			this.layout.floorTiles,
			this.#getStyle,
		)

		for (const wall of plan.wallSegments) {
			const style = this.#getStyle(wall.tile)
			const cargo = style.walls.require(wall.size)()
			const spatial = this.placer.placeProp(wall)
			const spawn = () => cargo.clone(spatial)
			const subject = new WallSubject(wall.tile, wall.location, spawn)
			this.cullableGrid.add(subject)
			this.fadingGrid.add(subject)
		}
	}

	dispose() {
		this.cullableGrid.dispose()
		this.fadingGrid.dispose()
	}
}


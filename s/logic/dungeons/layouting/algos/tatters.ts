
import {cellAlgo} from "../types.js"
import {Fattener} from "./utils/fattener.js"
import {goalposting} from "./utils/goalposting.js"

export const tatters = cellAlgo(options => {
	const {
		end,
		start,
		randy,
		tileGrid,
	} = options

	const p = tileGrid.percentageFn()
	const {walkables, goalposts} = goalposting({
		end,
		start,
		randy,
		tileGrid,
		distanceAlgo: "manhattan",
		goalcountRange: [1, p(2)],
	})
	const fattener = new Fattener(randy, tileGrid, walkables)

	fattener.grow(p(10))

	fattener.knobbify({
		count: randy.range(p(1), p(2)),
		size: randy.range(1, 2),
	})

	fattener.knobbify({
		count: randy.range(1, 2),
		size: randy.range(2, 3),
	})

	fattener.makeGoalpostBulbs(goalposts)

	return {walkables, goalposts}
})


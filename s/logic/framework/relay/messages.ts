
import {Feed, Feedback} from "./types.js"

export type Ping = ["ping", number]
export type Pong = ["pong", number]
export type FeedMessage = ["feed", Partial<Feed>]
export type FeedbackMessage = ["feedback", Partial<Feedback>]
export type GameMessage = Ping | Pong | FeedMessage | FeedbackMessage


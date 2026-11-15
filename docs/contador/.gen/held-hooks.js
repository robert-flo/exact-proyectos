import { answering } from './ts-fetch.js'; import { heldReply, looseFetch } from './held.js'; Object.assign(answering, { loose: looseFetch, heldReply });

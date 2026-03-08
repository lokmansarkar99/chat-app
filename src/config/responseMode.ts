import { RESPONSE_MODE } from "../constants/responseMode";

export const responseMode: RESPONSE_MODE =
  process.env.RESPONSE_MODE === RESPONSE_MODE.SOFT
    ? RESPONSE_MODE.SOFT
    : RESPONSE_MODE.STRICT;

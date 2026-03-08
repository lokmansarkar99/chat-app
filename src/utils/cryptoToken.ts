import crypto from "crypto"

const cryptoToken = (): string => {
  return crypto.randomBytes(32).toString("hex")
}
export default cryptoToken
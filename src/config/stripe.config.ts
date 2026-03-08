import config from '.';
import Stripe from 'stripe';



const stripe = new Stripe(config.stripe.secret_key as string, {
    apiVersion: "2026-02-25.clover",
    typescript: true
}) 

export default stripe;
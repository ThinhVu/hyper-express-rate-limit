<h1 align="center"> <code>hyper-express-rate-limit</code> </h1>

Basic rate-limiting middleware for [Hyper-express](https://github.com/kartikk221/hyper-express). Use to
limit repeated requests to public APIs and/or endpoints such as password reset.

## Usage

```ts
import { rateLimit } from 'hyper-express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
```

## Issues and Contributing

If you encounter a bug or want to see something added/changed, please go ahead
and
[open an issue](https://github.com/ThinhVu/hyper-express-rate-limit/issues/new)!
If you need help with something, feel free to
[start a discussion](https://github.com/ThinhVu/hyper-express-rate-limit/discussions/new)!

## Credit
This repository is clone 99.99% from `express-rate-limit`

Thanks to [Nathan Friedly](http://nfriedly.com/), [Vedant K](https://github.com/gamemaker1)

## License
MIT © ThinhVu

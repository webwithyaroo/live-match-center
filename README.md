## Match Dashboard

The dashboard is implemented as a server component using the App Router.  
Initial implementation focuses on correct data rendering and navigation, deferring real-time updates to a later phase to keep concerns separated.


## Match Detail View

The match detail page fetches full match information including events and statistics.
The implementation is intentionally server-rendered to ensure consistency before layering in real-time updates.


## Handling Live Data Volatility

Because matches are simulated in real time and rotated automatically by the backend,
match detail requests may occasionally return unavailable responses.
The application handles this gracefully using Next.js `notFound()` patterns rather than crashing.

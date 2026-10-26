# Classroom auction interface

This app extends the week08 Fleet Wars classroom interface and keeps its three-role architecture. The student and instructor views are task-focused; the projector prioritizes room-scale reading and phone entry.

Use the inherited warm off-white background, white panels with one thin border, system sans-serif text, charcoal foreground, muted gray supporting copy, and blue actions. Green confirms accepted actions; red names an error and recovery. Price and time use tabular numerals. Large type is reserved for the item, price, and countdown.

Students have a narrow single-column page, a persistent identity/balance line, one bid form, and completed results below. The instructor has the auction and queue form on the left, with budget, queue order, balances, backup, and reset on the right. The projector shows the active item on the left and a local-rendered QR/join URL on the right. At 700px and below these columns stack; short projectors reduce type and QR size to keep the current result and rules visible.

Controls have visible labels, 48px minimum height, keyboard focus outlines, validation, disabled states, and inline live feedback. No modal or auto-advance interrupts discussion. Changing items clears the student bid input, while incoming live updates preserve input during a round. Server deadlines and quoted prices govern actions; the browser countdown is informational.

The QR renderer is copied with its license from Fleet Wars. There are no external font, image, CSS, JavaScript, or QR services. Verify the current item, join QR, student form, balance after settlement, and instructor controls whenever changing the shared styles.

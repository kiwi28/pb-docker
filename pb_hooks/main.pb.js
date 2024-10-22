routerAdd("GET", "/hello/:name", (c) => {
	console.log("Hello from inside the hook get");
	let name = c.pathParam("name");

	return c.json(200, { message: "Hello " + name });
});

routerAdd("POST", "/test/:testId", (c) => {
	console.log("Hello from inside the hook post");
	const testId = c.pathParam("testId");

	return c.json(200, {
		testId,
	});
});

// send email to user after create record
onRecordAfterCreateRequest((e) => {
	const collectionName = e.record.tableName();

	// looks for the mappings record for this collections and retrieves the map column
	const mappingsObj = $app
		.dao()
		.findFirstRecordByData("mappings", "tableName", collectionName)
		?.get("map");

	const formData = e.record.columnValueMap();
	delete formData.id;
	delete formData.updated;

	const bossEmail = $app
		.dao()
		.findFirstRecordByData("mappings", "tableName", collectionName)
		?.get("userEmail");

	if (!bossEmail) {
		console.log(`No boss email found for collection: ${collectionName}`);
		return;
	}

	// send email to boss
	try {
		const message = new MailerMessage({
			from: {
				address: $app.settings().meta.senderAddress,
				name: $app.settings().meta.senderName,
			},
			to: [{ address: bossEmail }],
			subject: "O noua cerere a fost adaugata",
			html: `
      <h1>O noua cerere a fost adaugata</h1>
      <p>Detalii cerere:</p>
      <ul>
          ${Object.entries(formData)
						.map(
							([key, value]) =>
								`<li><strong>${mappingsObj?.[key]?.header}</strong>: ${value}</li>`
						)
						.join("")}
      </ul>
  `,
		});

		// console.log(
		// 	"message boss------------------------>",
		// 	JSON.stringify(message)
		// );

		$app.newMailClient().send(message);
	} catch (error) {
		console.log("error email send boss------------------------>", error);
	}

	try {
		const message = new MailerMessage({
			from: {
				address: $app.settings().meta.senderAddress,
				name: $app.settings().meta.senderName,
			},
			to: [{ address: e.record.get("email") }],
			subject: "Cererea ta a fost inregistrata cu succes",
			text: "Cererea ta a fost inregistrata cu succes",
		});

		// console.log(
		// 	"message user------------------------>",
		// 	JSON.stringify(message)
		// );

		$app.newMailClient().send(message);
	} catch (error) {
		console.log("error email send user------------------------>", error);
	}
});

// onCollectionAfterCreateRequest((e) => {
// 	console.log("e", JSON.stringify(e));
// 	console.log("e.httpContext", JSON.stringify(e.httpContext));
// 	console.log("e.collection", JSON.stringify(e.collection));
// 	console.log("e.tags", e.tags());
// });

const getMapping = (tableName) => {
	return;
};

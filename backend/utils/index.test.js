"use restrict";
const utils = require("./index");

test("Iframe only allowed with youtube", () => {
  let testData =
    'this is a <h1> test data </h1><p><iframe width="560" height="315" src="https://www.youtube.com/embed/vpbR3NEJmJM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  expect(utils.hasUnexpectedIframe(testData)).toBe(false);

  testData =
    'this is a <h1> test data </h1><p>t="315" src="https://www.youtube.com/embed/vpbR3NEJmJM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  expect(utils.hasUnexpectedIframe(testData)).toBe(false);

  testData =
    'this is a <h1> test data </h1><p><iframe width="560" height="315" src="https://www.youtube.com/embed/vpbR3NEJmJM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><iframe width="560" height="315" src="https://www.shouldnotpass.com/embed/vpbR3NEJmJM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  expect(utils.hasUnexpectedIframe(testData)).toBe(true);

  testData =
    'this is a <h1> test data </h1><p><iframe width="560" height="315" src="https://www.shouldnotpass.com/embed/vpbR3NEJmJM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><iframe width="560" height="315" src="https://www.youtube.com/embed/vpbR3NEJmJM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  expect(utils.hasUnexpectedIframe(testData)).toBe(true);
});

test("sanitizer test - empty body", () => {
	let testData;
    try {
		const actual = utils.sanitizeBody(testData);
		const expected = ""
		fail('it should not reach here');
	} catch (e) {
		// pass
	}
});

test("sanitizer test - empty body 2", () => {
	let testData = "     ";
    try {
		const actual = utils.sanitizeBody(testData);
		const expected = ""
		fail('it should not reach here');
	} catch (e) {
		// pass
	}
});

test("sanitizer test - empty body 3", () => {
	let testData = "<p><br></p>";
    try {
		const actual = utils.sanitizeBody(testData);
		const expected = ""
		fail('it should not reach here');
	} catch (e) {
		// pass
	}
});

test("sanitizer test - js events", () => {
	const testData = `<img src="zzz" onerror = "alert('hi')"><img src="zzz" onLoad = "alert('hi')">`;
	const actual = utils.sanitizeBody(testData);
	const expected = `<img src="zzz"  = "alert('hi')"><img src="zzz"  = "alert('hi')">`;
	expect(actual).toBe(expected);
});

test("sanitizer test - disallowed tags", () => {
	testData = ["<script>hi</script>", "&lt;script&gt;hi&lt;script&gt;"];
	const expected = `hi`;

	testData.forEach( (it) => {
		let testData = `<script>hi</script>`;
		const actual = utils.sanitizeBody(testData);
		expect(actual).toBe(expected);
	});
});

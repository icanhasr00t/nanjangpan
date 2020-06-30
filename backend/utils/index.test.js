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
		const actual = utils.sanitize(testData);
		const expected = ""
		fail('it should not reach here');
	} catch (e) {
		// pass
	}
});

test("sanitizer test - empty body 2", () => {
	let testData = "     ";
    try {
		const actual = utils.sanitize(testData);
		const expected = ""
		fail('it should not reach here');
	} catch (e) {
		// pass
	}
});

test("sanitizer test - empty body 3", () => {
	let testData = "<p><br></p>";
    try {
		const actual = utils.sanitize(testData);
		const expected = ""
		fail('it should not reach here');
	} catch (e) {
		// pass
	}
});

test("sanitizer test - js events", () => {
	const testData = `<img src="zzz" onerror = "alert('hi')"><img src="zzz" onLoad = "alert('hi')">`;
	const actual = utils.sanitize(testData);
	const expected = `<img src="zzz" "alert('hi')"><img src="zzz" "alert('hi')">`;
	expect(actual).toBe(expected);
});

test("sanitizer test - disallowed tags", () => {
	testData = ["<script>hi</script>", "<meta><script>hi</script>"];
	const expected = `hi`;
	testData.forEach( (it) => {
		const actual = utils.sanitize(it);
		expect(actual).toBe(expected);
	});
});


test("check4EmptyStrings test - ok", () => {
	const testData = `헌데르 달라빌ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
`;
    try{
		utils.check4EmptyStrings(testData)
	} catch (e) {
		fail('it should not reach here');
	}

	const testData2 = testData.replace(`헌데르 달라빌`,"");
    try{
		utils.check4EmptyStrings(testData2)
		fail('it should not reach here');
	} catch (e) {
	}
});

test("On blar removal test", () => {
   const testData = [
	`<img src="about:blank" style="display: none;" ononerrorerror="alert('XSS&#32;테스트')">`,
	`<img src="about:blank" style="display: none;" onclick='alert('XSS&#32;테스트')'>`,
	`<img src="about:blank" style="display: none;" ononerrorfocus="alert('XSS&#32;테스트')">`,
	`<img src="about:blank" style="display: none;" ononerrorerror = "alert('XSS&#32;테스트')">`,
	`<img src="about:blank" style="display: none;" onclick ='alert('XSS&#32;테스트')'>`,
	`<img src="about:blank" style="display: none;" ononerrorfocus= "alert('XSS&#32;테스트')">`,
    `<img src="about:blank" style="display:none;" data-my="test"/onerror="alert()">`,
	];

	testData.forEach((v) => {
		const data = utils.removeEvents(v);
		if (utils.REX_EVENT_TARGET.test(data)) {
			fail(`case failed with ${v}`);
		}
	});
});
